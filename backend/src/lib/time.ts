import { utc } from '@date-fns/utc';
import { differenceInCalendarDays, eachDayOfInterval, endOfDay, format, isAfter, parse, startOfDay } from 'date-fns';

export function startOfDayTimestamp(source: string) {
  const now = new Date();

  return Math.floor(startOfDay(parse(source, 'yyyy-MM-dd', now, { in: utc })).getTime() / 1000);
}

export function endOfDayTimestamp(source: string) {
  const now = new Date();

  return Math.floor(endOfDay(parse(source, 'yyyy-MM-dd', now, { in: utc })).getTime() / 1000);
}

export function todayUtcDate() {
  const now = new Date();

  return formatDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
}

export function lastMonthStartUtcDate() {
  const now = new Date();

  return formatDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
}

export function lastMonthEndUtcDate() {
  const now = new Date();

  return formatDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)));
}

export function atHourUtc(date: string, hour: number) {
  const targetDateTime = new Date(date);
  targetDateTime.setUTCHours(hour, 0, 0, 0);

  return targetDateTime;
}

export function formatDate(source: Date) {
  return format(source, 'yyyy-MM-dd', { in: utc });
}

export function getDatesInRange(dateFrom: string, dateTo: string, maxDays: number): string[] {
  const utcDateFrom = new Date(`${dateFrom}T00:00:00Z`);
  const utcDateTo = new Date(`${dateTo}T00:00:00Z`);

  if (isAfter(utcDateFrom, utcDateTo)) {
    throw new Error('dateTo must be after or equal to dateFrom.');
  }

  const dayDiff = differenceInCalendarDays(utcDateTo, utcDateFrom);
  if (dayDiff > maxDays) {
    throw new Error(`Date range cannot exceed ${maxDays} days.`);
  }

  const dates = eachDayOfInterval({ start: utcDateFrom, end: utcDateTo });

  return dates.map((date) => format(date, 'yyyy-MM-dd'));
}
