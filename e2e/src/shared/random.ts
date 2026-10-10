import { randomUUID } from 'crypto';

const RANDOM_LENGTH = 8;

export function randomId() {
  return randomUUID().replace(/-/g, '').substring(0, RANDOM_LENGTH);
}

export function randomName(prefix: string) {
  return `${prefix}-${randomId()}`;
}
