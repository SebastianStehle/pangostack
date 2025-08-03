import { utc } from '@date-fns/utc';
import { endOfDay, format, parse, startOfDay } from 'date-fns';

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
