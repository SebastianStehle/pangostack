import { randomUUID } from 'crypto';

// Produces a collision-free identifier so tests seed unique rows and can run repeatedly without
// depending on cleanup between runs.
export function uniqueId(prefix = 'id') {
  return `${prefix}-${randomUUID()}`;
}
