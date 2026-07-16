import { buildChartInterpretation, streamText, type Topic } from '@/lib/ziwei/local-analysis';
import type { ZiweiChart } from '@/lib/ziwei/types';

export const dynamic = 'force-dynamic';

interface InterpretBody {
  chart?: ZiweiChart;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  topic?: Topic;
  period?: string | null;
  palaceBranch?: number | null;
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
  });

  return new Response(streamText(localAnswer), {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-AI-Provider': 'local-knowledge',
    },
  });
}
