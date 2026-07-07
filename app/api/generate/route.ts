import { NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo } from '@/lib/ziwei/types';

export const dynamic = 'force-dynamic';

function toBirthInfo(value: Partial<BirthInfo>): BirthInfo | null {
  const year = Number(value.year);
  const month = Number(value.month);
  const day = Number(value.day);
  const hour = Number(value.hour);
  const gender = value.gender === 'female' ? 'female' : value.gender === 'male' ? 'male' : null;

  if (!year || !month || !day || Number.isNaN(hour) || !gender) return null;
  if (year < 1900 || year > 2026 || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 11) {
    return null;
  }

  return {
    year,
    month,
    day,
    hour,
    gender,
    name: value.name,
    province: value.province,
    city: value.city,
    longitude: typeof value.longitude === 'number' ? value.longitude : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const birthInfo = toBirthInfo(await request.json());
    if (!birthInfo) {
      return NextResponse.json({ error: 'Invalid birth info' }, { status: 400 });
    }

    return NextResponse.json(generateChart(birthInfo));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate chart' }, { status: 500 });
  }
}
