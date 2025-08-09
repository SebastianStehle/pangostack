import { format } from 'date-fns';
import { texts } from 'src/texts';

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
