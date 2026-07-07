import type { ZiweiChart } from '@/lib/ziwei/types';

type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';
const DEFAULT_MODEL = 'glm-4.6v';

export function isZhipuConfigured(): boolean {
  return Boolean(process.env.ZHIPU_API_KEY || process.env.BIGMODEL_API_KEY);
}

function zhipuConfig() {
  return {
    apiKey: process.env.ZHIPU_API_KEY || process.env.BIGMODEL_API_KEY || '',
    baseUrl: (process.env.ZHIPU_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: process.env.ZHIPU_MODEL || DEFAULT_MODEL,
  };
}

function starText(stars: ZiweiChart['palaces'][number]['stars']) {
  if (!stars.length) return '无主星';
  return stars.map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`).join('、');
}

export function summarizeChart(chart: ZiweiChart): string {
  const birth = chart.birthInfo;
  const currentDaXian = chart.daXians[chart.currentDaXianIndex];
  const palaceLines = chart.palaces.map(palace => {
    const marks = [
      palace.isMingGong ? '命宫' : '',
      palace.isShenGong ? '身宫' : '',
      palace.isCurrentDaXian ? '当前大限' : '',
    ].filter(Boolean).join('/');
    return `- ${palace.name}${marks ? `（${marks}）` : ''}：${starText(palace.stars)}；大限${palace.daXianAge ? `${palace.daXianAge[0]}-${palace.daXianAge[1]}岁` : '无'}`;
  }).join('\n');

  return [
    `出生：${birth.year}-${birth.month}-${birth.day}，时辰索引 ${birth.hour}，性别 ${birth.gender === 'male' ? '男' : '女'}，地点 ${birth.province ?? ''}${birth.city ?? ''}`,
    `农历：${chart.lunarInfo.lunarYear}年 ${chart.lunarInfo.isLeapMonth ? '闰' : ''}${chart.lunarInfo.lunarMonth}月${chart.lunarInfo.lunarDay}日`,
    `命宫地支索引：${chart.mingGongBranch}；身宫地支索引：${chart.shenGongBranch}；五行局：${chart.wuxingJuName}`,
    currentDaXian ? `当前大限：${currentDaXian.startAge}-${currentDaXian.endAge}岁，${currentDaXian.palaceName}` : '当前大限：无',
    `十二宫：\n${palaceLines}`,
  ].join('\n');
}

export function chartSystemPrompt(): string {
  return [
    '你是 Metis 紫微斗数文化研究平台的命盘解读助手。',
    '你需要基于用户提供的紫微斗数命盘结构做中文解读。',
    '输出必须使用清晰的 Markdown 段落，章节标题尽量使用 **【标题】** 格式。',
    '保持克制、具体、可读，不要夸大断言，不要宣称能决定命运。',
    '涉及健康、投资、法律等内容时，只给文化研究和行动提醒，不替代专业建议。',
  ].join('\n');
}

export function hemingSystemPrompt(): string {
  return [
    '你是 Metis 紫微斗数文化研究平台的合盘分析助手。',
    '你需要对两张紫微斗数命盘做关系结构分析，重点看命宫、夫妻宫、福德宫、财帛宫和三方四正。',
    '输出必须使用中文，章节标题尽量使用 **【标题】** 格式。',
    '重点提供缘分定性、双方命宫、夫妻宫互看、内在需求、相处建议。',
    '保持克制，不要给绝对化结论，不要制造焦虑。',
  ].join('\n');
}

export async function createZhipuTextStream(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, baseUrl, model } = zhipuConfig();
  if (!apiKey) throw new Error('Zhipu API key is not configured');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      thinking: {
        type: process.env.ZHIPU_THINKING || 'disabled',
      },
      temperature: 0.72,
      max_tokens: 1800,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Zhipu API failed: ${response.status} ${detail.slice(0, 200)}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  return response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        if (data === '[DONE]') {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: content } })}\n\n`));
          }
        } catch {
          // Ignore non-JSON keepalive chunks.
        }
      }
    },
    flush(controller) {
      const line = buffer.trim();
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? '';
        if (content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: content } })}\n\n`));
        }
      } catch {
        // Ignore an incomplete trailing event.
      }
    },
  }));
}
