import { buildChartInterpretation, streamText, type Topic } from '@/lib/ziwei/local-analysis';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { recordQuestion } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface InterpretBody {
  chart?: ZiweiChart;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  topic?: Topic;
  period?: string | null;
  palaceBranch?: number | null;
  locale?: 'zh' | 'en';
}

export async function POST(request: Request) {
  const body = (await request.json()) as InterpretBody;
  if (!body.chart) {
    return new Response('Missing chart', { status: 400 });
  }

  const prompt = [...(body.messages ?? [])].reverse().find(message => message.role === 'user')?.content ?? '';
  const localAnswer = buildChartInterpretation(body.chart, prompt, {
    topic: body.topic,
    period: body.period,
    palaceBranch: body.palaceBranch,
    locale: body.locale,
  });

  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream; charset=utf-8',
    'X-AI-Provider': 'local-knowledge',
  };

  try {
    const stats = await recordQuestion(request, 'chart');
    if (stats.setCookie) {
      headers['Set-Cookie'] = stats.setCookie;
    }
  } catch (error) {
    console.warn('Failed to record chart question stats:', error);
  }

  return new Response(streamText(localAnswer), {
    headers: {
      ...headers,
    },
  });
}
