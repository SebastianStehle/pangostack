import { describe, expect, it } from 'vitest';
import { pollUntil } from './wait';

const TIMEOUT = 200;
const POLL_INTERVAL = 10;

describe('pollUntil', () => {
  it('should resolve when the action succeeds before the timeout', async () => {
    let attempts = 0;

    await pollUntil(TIMEOUT, async () => ++attempts >= 2, POLL_INTERVAL);

    expect(attempts).toBe(2);
  });

  it('should throw with the last error when the action keeps failing until the timeout', async () => {
    const promise = pollUntil(TIMEOUT, () => Promise.reject(new Error('not ready')), POLL_INTERVAL);

    await expect(promise).rejects.toThrow(`Timeout: Instance did not become ready within ${TIMEOUT}ms. Last error: not ready`);
  });

  it('should throw a plain timeout error when the action never returns true', async () => {
    const promise = pollUntil(TIMEOUT, () => Promise.resolve(false), POLL_INTERVAL);

    await expect(promise).rejects.toThrow(`Timeout: Instance did not become ready within ${TIMEOUT}ms.`);
  });
});
