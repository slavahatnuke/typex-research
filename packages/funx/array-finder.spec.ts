import { ArrayFinder, StrictArrayFinder } from './array-finder';

import { describe, expect, test } from 'vitest';

describe(ArrayFinder.name, () => {
  test('should work', () => {
    const finder = ArrayFinder([1, 2, 3], (item) => item);
    expect(finder(1)).toBe(1);
    expect(finder(2)).toBe(2);
    expect(finder(3)).toBe(3);
    expect(finder(4)).toBe(undefined);
  });

  test('should work with objects', () => {
    const finder = ArrayFinder(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      (item) => item.id,
    );
    expect(finder(1)).toEqual({ id: 1 });
    expect(finder(2)).toEqual({ id: 2 });
    expect(finder(3)).toEqual({ id: 3 });
    expect(finder(4)).toBe(undefined);
  });

  test('should work with objects where key is object', () => {
    const finder = ArrayFinder(
      [
        { a: 1, b: 1, name: 'name 1' },
        { a: 1, b: 2, name: 'name 2' },
        { a: 1, b: 3, name: 'name 3' },
      ],
      (item) => ({ a: item.a, b: item.b }),
    );
    expect(finder({ a: 1, b: 1 })).toEqual({ a: 1, b: 1, name: 'name 1' });
    expect(finder({ a: 1, b: 2 })).toEqual({ a: 1, b: 2, name: 'name 2' });
    expect(finder({ a: 1, b: 3 })).toEqual({ a: 1, b: 3, name: 'name 3' });

    expect(finder({ b: 1, a: 1 })).toEqual({ a: 1, b: 1, name: 'name 1' });
    expect(finder({ b: 2, a: 1 })).toEqual({ a: 1, b: 2, name: 'name 2' });
    expect(finder({ b: 3, a: 1 })).toEqual({ a: 1, b: 3, name: 'name 3' });

    expect(finder({ a: 10, b: 100 })).toEqual(undefined);
  });
});

describe(StrictArrayFinder.name, () => {
  test('should work', () => {
    const finder = StrictArrayFinder(
      [1, 2, 3],
      (item) => item,
      (item) => `Not found ${item}`,
    );
    expect(finder(1)).toBe(1);
    expect(finder(2)).toBe(2);
    expect(finder(3)).toBe(3);

    // error case
    expect(() => finder(4)).toThrow('Not found 4');
  });
});
