import { delay } from './delay';
import { Timer } from './timer';

import { expect, test, vi, it } from 'vitest';

test('Timer.start', async () => {
  const fn = vi.fn();

  const timer = Timer(50);
  timer.start(fn);

  await delay(1);

  expect(fn.mock.calls.length).toEqual(0);

  await delay(200);

  expect(fn.mock.calls.length).toEqual(1);
});

test('Timer.stop', async () => {
  const fn = vi.fn();

  const timer = Timer(100);
  timer.start(fn);

  await delay(10);

  expect(fn.mock.calls.length).toEqual(0);

  timer.stop();

  expect(fn.mock.calls.length).toEqual(0);

  await delay(200);

  expect(fn.mock.calls.length).toEqual(0);
});

test('Timer with null or undefined', async () => {
  const fn = vi.fn();

  const timer = Timer(null);
  timer.start(fn);

  await delay(200);

  expect(fn.mock.calls.length).toEqual(0);
});
