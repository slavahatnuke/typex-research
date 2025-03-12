import { UnoPromise } from './promise';
import { Defer } from './defer';

import { expect, test, vi, it } from 'vitest';

test('UnoPromise', async () => {
  let counter = 0;

  const defer = Defer<string>();

  const next = UnoPromise(async () => {
    counter++;
    const value = await defer.promise;

    return {
      counter,
      value,
    };
  });

  process.nextTick(() => defer.resolve('abc'));
  await defer.promise;

  const nums = await Promise.all([next(), next(), next()]);

  expect(counter).toEqual(3);
  expect(nums).toEqual([
    {
      counter: 3,
      value: 'abc',
    },
    {
      counter: 3,
      value: 'abc',
    },
    {
      counter: 3,
      value: 'abc',
    },
  ]);

  expect(await next()).toEqual({
    counter: 4,
    value: 'abc',
  });
});

test('UnoPromise.reset', async () => {
  let counter = 0;

  const defer = Defer<string>();

  const next = UnoPromise(async () => {
    const value = await defer.promise;

    counter++;

    return {
      counter,
      value,
    };
  });

  void next();

  void next.reset();

  process.nextTick(() => defer.resolve('abc'));

  expect(await next()).toEqual({
    counter: 2,
    value: 'abc',
  });
});
