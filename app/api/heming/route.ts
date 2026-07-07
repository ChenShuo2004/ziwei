import { buildHemingInterpretation, streamText } from '@/lib/ziwei/local-analysis';
import {
  createZhipuTextStream,
  hemingSystemPrompt,
  isZhipuConfigured,
  summarizeChart,
  type ChatMessage,
} from '@/lib/ai/zhipu';
import type { ZiweiChart } from '@/lib/ziwei/types';

export const dynamic = 'force-dynamic';

interface HemingBody {
  chartA?: ZiweiChart;
  chartB?: ZiweiChart;
  question?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as HemingBody;
  if (!body.chartA || !body.chartB) {
    return new Response('Missing charts', { status: 400 });
  }

  const fallback = buildHemingInterpretation(body.chartA, body.chartB, body.question);

  if (isZhipuConfigured()) {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: hemingSystemPrompt() },
        {
          role: 'user',
          content: [
            '以下是两张紫微斗数命盘结构，请做合盘分析。',
            '',
            '【甲方 A】',
            summarizeChart(body.chartA),
            '',
            '【乙方 B】',
            summarizeChart(body.chartB),
            '',
            body.question ? `用户追问：${body.question}` : '请输出完整合盘分析。',
          ].join('\n'),
        },
      ];

      return new Response(await createZhipuTextStream(messages), {
        headers: {
          'Cache-Control': 'no-cache, no-transform',
          'Content-Type': 'text/event-stream; charset=utf-8',
          'X-AI-Provider': 'zhipu',
        },
      });
    } catch (error) {
      console.error('[zhipu heming fallback]', error);
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
