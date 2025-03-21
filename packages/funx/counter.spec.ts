import { Counter } from './counter';
import { describe, expect, test } from 'vitest';

test('counter', async function () {
  const counter = Counter();

  expect(counter.value()).toEqual(0);
  counter.increment();
  counter.increment();
  expect(counter.value()).toEqual(2);

  counter.decrement();
  expect(counter.value()).toEqual(1);

  counter.increment(10);
  expect(counter.value()).toEqual(11);

  counter.decrement(2);
  expect(counter.value()).toEqual(9);
});

test('counter / pubsub', async function () {
  const counter = Counter();

  const values: number[] = [];
  const unsubscribe = counter.subscribe((cnt) => values.push(cnt));

  expect(counter.value()).toEqual(0);
  counter.increment();
  counter.increment();
  expect(counter.value()).toEqual(2);

  counter.decrement();
  expect(counter.value()).toEqual(1);

  counter.increment(10);
  expect(counter.value()).toEqual(11);

  counter.decrement(2);
  expect(counter.value()).toEqual(9);
  expect(values).toEqual([1, 2, 1, 11, 9]);

  counter.reset();

  expect(values).toEqual([1, 2, 1, 11, 9, 0]);
  expect(counter.value()).toEqual(0);

  counter.increment(100);
  expect(counter.value()).toEqual(100);
  expect(values).toEqual([1, 2, 1, 11, 9, 0, 100]);

  unsubscribe();

  counter.increment(1000);
  expect(counter.value()).toEqual(1100);
  expect(values).toEqual([1, 2, 1, 11, 9, 0, 100]);
});
