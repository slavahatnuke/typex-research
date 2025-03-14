import { delay } from './delay';

import { describe, expect, test } from 'vitest';

describe('delay / lib', () => {
  test('waits as intended', async () => {
    const ms = 200;
    const d1 = Date.now();

    await delay(ms);
    const d2 = Date.now();

    expect(Math.round((d2 - d1) / ms)).toEqual(1);
  });
});
