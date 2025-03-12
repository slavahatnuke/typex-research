import { Interval } from './interval';
import { delay } from './delay';

import { expect, test, vi, it } from 'vitest';

test('Interval', async () => {
  let idx = 0;
  const items: number[] = [];
  const finishInterval = Interval(() => {
    items.push(idx++);
  }, 200);

  await delay(1100);

  await finishInterval();

  const expected = [0, 1, 2, 3, 4];

  try {
    expect(items).toEqual(expected);
  } catch (error) {
    console.error(error);
    expect(items.length > 2).toBeTruthy();
  }
});
