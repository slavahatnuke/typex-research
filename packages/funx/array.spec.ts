import { Exclude, groupBy, hashMapBy, orderBy, Pick, uniqBy } from './array';

import { expect, test, vi, it } from 'vitest';

test('Exclude', async () => {
  const exclude = Exclude(['a', 'b']);

  expect(
    exclude({
      a: 1,
      b: 2,
      c: 3,
    }),
  ).toEqual({ c: 3 });
});

test('Pick', async () => {
  const pick = Pick(['a', 'b']);

  expect(
    pick({
      a: 1,
      b: 2,
      c: 3,
    }),
  ).toEqual({
    a: 1,
    b: 2,
  });

  expect(
    pick({
      a: 1,
    }),
  ).toEqual({
    a: 1,
    b: null,
  });
});

test('Pick without defaults', async () => {
  const pick = Pick(['a', 'b'], null);

  expect(
    pick({
      a: 1,
      b: 2,
      c: 3,
    }),
  ).toEqual({
    a: 1,
    b: 2,
  });

  expect(
    pick({
      a: 1,
    }),
  ).toEqual({
    a: 1,
  });
});

test('groupBy', async () => {
  const out = groupBy<{ type: string; value: string }>(
    [
      { type: 'T1', value: 'v1' },
      { type: 'T1', value: 'v2' },
      { type: 'T2', value: 'v3' },
    ],
    ({ type }) => type,
  );

  expect(out).toEqual({
    T1: [
      {
        type: 'T1',
        value: 'v1',
      },
      {
        type: 'T1',
        value: 'v2',
      },
    ],
    T2: [
      {
        type: 'T2',
        value: 'v3',
      },
    ],
  });
});

test('uniqBy', async () => {
  type DataType = { name: string; id: number };

  const data: DataType[] = [
    {
      id: 1,
      name: 'dev1',
    },
    {
      id: 2,
      name: 'dev1',
    },
  ];

  const uniqByName = uniqBy<DataType>(data, ({ name }) => name);

  expect(uniqByName).toEqual([
    {
      id: 2,
      name: 'dev1',
    },
  ]);

  const uniqById = uniqBy<DataType>(data, ({ id }) => id);

  expect(uniqById).toEqual([
    {
      id: 1,
      name: 'dev1',
    },
    {
      id: 2,
      name: 'dev1',
    },
  ]);
});

test('hashMapBy', async () => {
  type DataType = { name: string; id: number };

  const data: DataType[] = [
    {
      id: 1,
      name: 'dev1',
    },
    {
      id: 2,
      name: 'dev1',
    },
  ];

  const hashMapByName = hashMapBy<DataType>(data, ({ name }) => name);

  expect(hashMapByName).toEqual({
    dev1: {
      id: 2,
      name: 'dev1',
    },
  });

  const hashMapById = hashMapBy<DataType>(data, ({ id }) => id);

  expect(hashMapById).toEqual({
    '1': {
      id: 1,
      name: 'dev1',
    },
    '2': {
      id: 2,
      name: 'dev1',
    },
  });
});

test('orderBy', async () => {
  const subject = [{ rank: 2 }, { rank: 3 }, { rank: 1 }];

  const ascResult = [...subject].sort(orderBy(({ rank }) => rank, 'asc'));
  expect(ascResult).toEqual([{ rank: 1 }, { rank: 2 }, { rank: 3 }]);

  const descResult = [...subject].sort(orderBy(({ rank }) => rank, 'desc'));
  expect(descResult).toEqual([{ rank: 3 }, { rank: 2 }, { rank: 1 }]);
});
