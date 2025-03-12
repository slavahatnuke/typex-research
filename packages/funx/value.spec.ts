import { Value } from './value';
import { Collect } from './collect';

import { expect, test, vi, it } from 'vitest';

test('Value', async () => {
  const value = Value<number>(123);

  expect(value()).toEqual(123);

  value(345);

  expect(value()).toEqual(345);

  const v2 = Value<string>('1231');
  expect(v2()).toEqual('1231');
});

test('Value / toValue', async () => {
  const value = Value<string>('abc');
  expect(value()).toEqual('abc');

  value('werty');
  expect(value()).toEqual('werty');
});

test('Value / subscribe', async () => {
  const value = Value<string>('abc');
  const values = Collect();
  const unsubscribe = value.subscribe(values);
  value('a1');
  value('a2');
  value('a3');
  expect(value()).toEqual('a3');
  expect(values()).toEqual(['a1', 'a2', 'a3']);

  unsubscribe();
  value('a4');
  expect(values()).toEqual(['a1', 'a2', 'a3']);
});
