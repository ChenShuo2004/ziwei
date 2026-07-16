import { buildHemingInterpretation, streamText } from '@/lib/ziwei/local-analysis';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { recordQuestion } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream; charset=utf-8',
    'X-AI-Provider': 'local-knowledge',
  };

  try {
    const stats = await recordQuestion(request, 'heming');
    if (stats.setCookie) {
      headers['Set-Cookie'] = stats.setCookie;
    }
  } catch (error) {
    console.warn('Failed to record heming question stats:', error);
  }

  return new Response(streamText(localAnswer), {
    headers: {
      ...headers,
    },
  });
}
