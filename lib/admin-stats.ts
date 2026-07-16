import { randomUUID, createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Redis from 'ioredis';

export type QuestionSource = 'chart' | 'heming';

export interface QuestionStats {
  totalQuestions: number;
  uniqueVisitors: number;
  sources: Record<QuestionSource, number>;
  daily: Record<string, number>;
  lastAskedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuestionStatsFile {
  totalQuestions: number;
  visitorHashes: string[];
  sources: Record<QuestionSource, number>;
  daily: Record<string, number>;
  lastAskedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const COOKIE_NAME = 'warmth_visitor_id';
const DATA_DIR = path.join(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'question-stats.json');
const VISITOR_SECRET = process.env.VISITOR_HASH_SECRET || process.env.ADMIN_ACCESS_TOKEN || 'warmth-local-stats';
const REDIS_KEY_PREFIX = 'warmth:question-stats';

type RedisClient = InstanceType<typeof Redis>;

function getRedis() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const globalScope = globalThis as typeof globalThis & { questionStatsRedis?: RedisClient };
  if (!globalScope.questionStatsRedis) {
    globalScope.questionStatsRedis = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
  }
  return globalScope.questionStatsRedis;
}

const emptyStats = (): QuestionStatsFile => {
  const now = new Date().toISOString();
  return {
    totalQuestions: 0,
    visitorHashes: [],
    sources: { chart: 0, heming: 0 },
    daily: {},
    lastAskedAt: null,
    createdAt: now,
    updatedAt: now,
  };
};

function parseCookie(header: string | null, name: string) {
  if (!header) return null;
  const cookies = header.split(';').map(part => part.trim());
  const pair = cookies.find(part => part.startsWith(`${name}=`));
  if (!pair) return null;
  return decodeURIComponent(pair.slice(name.length + 1));
}

function hashVisitor(visitorId: string) {
  return createHash('sha256').update(`${VISITOR_SECRET}:${visitorId}`).digest('hex');
}

export function getStatsDayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

async function readStatsFile(): Promise<QuestionStatsFile> {
  try {
    const raw = await readFile(STATS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<QuestionStatsFile>;
    return {
      ...emptyStats(),
      ...parsed,
      visitorHashes: Array.isArray(parsed.visitorHashes) ? parsed.visitorHashes : [],
      sources: { chart: 0, heming: 0, ...(parsed.sources ?? {}) },
      daily: parsed.daily ?? {},
    };
  } catch {
    return emptyStats();
  }
}

async function writeStatsFile(stats: QuestionStatsFile) {
  await mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${STATS_FILE}.${process.pid}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
  await rename(tempFile, STATS_FILE);
}

async function recordQuestionInRedis(visitorHash: string, source: QuestionSource, now: Date) {
  const redis = getRedis();
  if (!redis) return false;

  const nowIso = now.toISOString();
  const dayKey = getStatsDayKey(now);

  await redis
    .multi()
    .setnx(`${REDIS_KEY_PREFIX}:created-at`, nowIso)
    .incr(`${REDIS_KEY_PREFIX}:total`)
    .sadd(`${REDIS_KEY_PREFIX}:visitors`, visitorHash)
    .hincrby(`${REDIS_KEY_PREFIX}:sources`, source, 1)
    .hincrby(`${REDIS_KEY_PREFIX}:daily`, dayKey, 1)
    .set(`${REDIS_KEY_PREFIX}:last-asked-at`, nowIso)
    .set(`${REDIS_KEY_PREFIX}:updated-at`, nowIso)
    .exec();

  return true;
}

async function getRedisStats(): Promise<QuestionStats | null> {
  const redis = getRedis();
  if (!redis) return null;

  const [total, uniqueVisitors, sources, daily, lastAskedAt, createdAt, updatedAt] = await Promise.all([
    redis.get(`${REDIS_KEY_PREFIX}:total`),
    redis.scard(`${REDIS_KEY_PREFIX}:visitors`),
    redis.hgetall(`${REDIS_KEY_PREFIX}:sources`),
    redis.hgetall(`${REDIS_KEY_PREFIX}:daily`),
    redis.get(`${REDIS_KEY_PREFIX}:last-asked-at`),
    redis.get(`${REDIS_KEY_PREFIX}:created-at`),
    redis.get(`${REDIS_KEY_PREFIX}:updated-at`),
  ]);

  return {
    totalQuestions: Number(total ?? 0),
    uniqueVisitors,
    sources: {
      chart: Number(sources.chart ?? 0),
      heming: Number(sources.heming ?? 0),
    },
    daily: Object.fromEntries(Object.entries(daily).map(([day, count]) => [day, Number(count)])),
    lastAskedAt,
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt: updatedAt ?? createdAt ?? new Date().toISOString(),
  };
}

export async function recordQuestion(request: Request, source: QuestionSource) {
  const existingVisitorId = parseCookie(request.headers.get('cookie'), COOKIE_NAME);
  const visitorId = existingVisitorId || randomUUID();
  const visitorHash = hashVisitor(visitorId);
  const now = new Date();

  const recordedInRedis = await recordQuestionInRedis(visitorHash, source, now);
  if (!recordedInRedis) {
    const stats = await readStatsFile();
    const dayKey = getStatsDayKey(now);

    stats.totalQuestions += 1;
    stats.sources[source] = (stats.sources[source] ?? 0) + 1;
    stats.daily[dayKey] = (stats.daily[dayKey] ?? 0) + 1;
    stats.lastAskedAt = now.toISOString();
    stats.updatedAt = now.toISOString();

    if (!stats.visitorHashes.includes(visitorHash)) {
      stats.visitorHashes.push(visitorHash);
    }

    await writeStatsFile(stats);
  }

  return {
    setCookie: existingVisitorId
      ? null
      : `${COOKIE_NAME}=${encodeURIComponent(visitorId)}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`,
  };
}

export async function getQuestionStats(): Promise<QuestionStats> {
  const redisStats = await getRedisStats();
  if (redisStats) return redisStats;

  const stats = await readStatsFile();
  return {
    totalQuestions: stats.totalQuestions,
    uniqueVisitors: stats.visitorHashes.length,
    sources: stats.sources,
    daily: stats.daily,
    lastAskedAt: stats.lastAskedAt,
    createdAt: stats.createdAt,
    updatedAt: stats.updatedAt,
  };
}

export function canViewAdminStats(token?: string | null) {
  const configuredToken = process.env.ADMIN_ACCESS_TOKEN;
  return !configuredToken || token === configuredToken;
}
