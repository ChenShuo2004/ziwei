import { buildHemingInterpretation, streamText } from '@/lib/ziwei/local-analysis';
import type { ZiweiChart } from '@/lib/ziwei/types';

export const dynamic = 'force-dynamic';

interface HemingBody {
  chartA?: ZiweiChart;
  chartB?: ZiweiChart;
  question?: string;
  locale?: 'zh' | 'en';
}

export async function POST(request: Request) {
  const body = (await request.json()) as HemingBody;
  if (!body.chartA || !body.chartB) {
    return new Response('Missing charts', { status: 400 });
  }

  const localAnswer = buildHemingInterpretation(body.chartA, body.chartB, body.question, body.locale);

  return new Response(streamText(localAnswer), {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-AI-Provider': 'local-knowledge',
    },
  });
}
