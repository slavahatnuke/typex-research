
import { flatten } from './flatten';

import {test, expect} from 'vitest'

test(flatten.name, async () => {
  const actual = flatten(1);
  expect(actual).toEqual([1]);
  expect(flatten([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5]);
  expect(flatten([1, [2, [3, [4, 5]]], 6])).toEqual([1, 2, 3, 4, 5, 6]);
  expect(flatten([1, [2, [3, [4, 5, [6, 7]]]], 8])).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8,
  ]);
});
