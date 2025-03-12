import { deepEqual, sortObject } from './sort-object';

import { expect, test, vi, it } from 'vitest';

test('sortObject', async () => {
  expect(sortObject(123)).toEqual(123);

  expect(sortObject([1, 2, 3])).toEqual([1, 2, 3]);
  expect(sortObject([2, 3, 1])).toEqual([1, 2, 3]);

  expect(sortObject([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual([
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
  ]);

  expect(sortObject([{ id: 3 }, { id: 1 }, { id: 2 }])).toEqual([
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
  ]);
});

test('deepEqual', async () => {
  expect(deepEqual(1, 1)).toEqual(true);
  expect(
    deepEqual(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ id: 1 }, { id: 3 }, { id: 2 }],
    ),
  ).toEqual(true);
  expect(
    deepEqual([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 3 }, { id: 2 }]),
  ).toEqual(false);
});
