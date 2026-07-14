import { Lunar } from 'lunar-javascript';

export type CalendarType = 'solar' | 'lunar';

export interface BirthDateInput {
  year: string;
  month: string;
  day: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
}

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

export function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function birthDateToSolarDate(input: BirthDateInput): SolarDate | null {
  const year = parseInt(input.year) || 0;
  const month = parseInt(input.month) || 0;
  const day = parseInt(input.day) || 0;
  if (!year || !month || !day) return null;

  if ((input.calendar ?? 'solar') === 'solar') {
    return isValidSolarDate(year, month, day) ? { year, month, day } : null;
  }

  try {
    const lunarMonth = input.isLeapMonth ? -month : month;
    const lunar = Lunar.fromYmd(year, lunarMonth, day);
    const solar = lunar.getSolar();
    const roundTrip = solar.getLunar();
    if (
      roundTrip.getYear() !== year ||
      roundTrip.getMonth() !== lunarMonth ||
      roundTrip.getDay() !== day
    ) {
      return null;
    }
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
    };
  } catch {
    return null;
  }
}
