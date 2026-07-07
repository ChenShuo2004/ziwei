import { buildChartInterpretation, streamText } from '@/lib/ziwei/local-analysis';
import {
  chartSystemPrompt,
  createZhipuTextStream,
  isZhipuConfigured,
  summarizeChart,
  type ChatMessage,
} from '@/lib/ai/zhipu';
import type { ZiweiChart } from '@/lib/ziwei/types';

export const dynamic = 'force-dynamic';

interface InterpretBody {
  chart?: ZiweiChart;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as InterpretBody;
  if (!body.chart) {
    return new Response('Missing chart', { status: 400 });
  }

  const prompt = [...(body.messages ?? [])].reverse().find(message => message.role === 'user')?.content ?? '';
  const fallback = buildChartInterpretation(body.chart, prompt);

  if (isZhipuConfigured()) {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: chartSystemPrompt() },
        { role: 'user', content: `以下是紫微斗数命盘结构，请只基于这些结构解读：\n\n${summarizeChart(body.chart)}` },
        ...(body.messages ?? []).slice(-8).map(message => ({
          role: message.role,
          content: message.content,
        })),
      ];

      return new Response(await createZhipuTextStream(messages), {
        headers: {
          'Cache-Control': 'no-cache, no-transform',
          'Content-Type': 'text/event-stream; charset=utf-8',
          'X-AI-Provider': 'zhipu',
        },
      });
    } catch (error) {
      console.error('[zhipu interpret fallback]', error);
    }
  }

  return new Response(streamText(fallback), {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-AI-Provider': 'local-fallback',
    },
  });
}
