import { ArrayIndex } from './array-index';

import { describe, expect, it } from 'vitest';

describe(ArrayIndex.name, () => {
  test('ArrayIndex by scalar', () => {
    const items = [
      {
        id: 1,
        parentId: 1,
        name: 'name 1',
      },
      {
        id: 2,
        parentId: 1,
        name: 'name 2',
      },
      {
        id: 3,
        parentId: 0,
        name: 'name 3',
      },
    ] as const;
    const finderByParentId = ArrayIndex(items, ({ parentId }) => parentId);

    expect(finderByParentId(1)).toEqual([
      {
        id: 1,
        name: 'name 1',
        parentId: 1,
      },
      {
        id: 2,
        name: 'name 2',
        parentId: 1,
      },
    ]);
    expect(finderByParentId(0)).toEqual([
      {
        id: 3,
        name: 'name 3',
        parentId: 0,
      },
    ]);
    expect(finderByParentId(100 as any)).toEqual([]);
  });

  test('ArrayIndex by object', () => {
    const items = [
      {
        id: 1,
        parentId: 1,
        name: 'name 1',
      },
      {
        id: 2,
        parentId: 1,
        name: 'name 2',
      },
      {
        id: 3,
        parentId: 0,
        name: 'name 3',
      },
    ] as const;
    const filterByIdName = ArrayIndex(items, ({ id, name }) => ({ id, name }));

    const result = filterByIdName({ id: 1, name: 'name 1' });

    expect(result).toEqual([
      {
        id: 1,
        name: 'name 1',
        parentId: 1,
      },
    ]);
    expect(filterByIdName({ id: 100, name: 500 } as any)).toEqual([]);
    expect(filterByIdName({ id: 1, name: 'name 2' })).toEqual([]);
  });
});
