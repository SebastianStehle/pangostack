import { format } from 'date-fns';
import { texts } from 'src/texts';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

export function formatFileSize(value: number, factor = 1024) {
  let u = 0;

  while (value >= factor || -value >= factor) {
    value /= factor;
    u++;
  }

  return (u ? `${value.toFixed(1)} ` : value) + ' kMGTPEZY'[u] + 'B';
}

export function formatBoolean(value: boolean) {
  return value ? texts.common.yes : texts.common.no;
}

export function formatDateTime(value: Date) {
  return format(value, 'Pp');
}

export function formatDate(value: Date) {
  return format(value, 'P');
}

export function formatTime(value: Date) {
  return format(value, 'p');
}

export function formatDuration(startedAt?: Date | string | null, completedAt?: Date | string | null) {
  if (!startedAt) {
    return null;
  }

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();

  const totalSeconds = Math.max(0, Math.round((end - start) / MILLISECONDS_PER_SECOND));
  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${minutes}m ${seconds}s`;
}

export function formatTrue(value: boolean) {
  return value ? texts.common.yes : '';
}

export function formatTags(value?: string[] | null) {
  return value?.join(', ') || '';
}

const NUMBER_FORMATS: Record<string, Intl.NumberFormat> = {};

export function formatMoney(value: number, currency: string) {
  const format = (NUMBER_FORMATS[currency] ||= new Intl.NumberFormat('en-US', { style: 'currency', currency }));

  return format.format(value);
}
