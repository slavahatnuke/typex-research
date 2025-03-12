import { memos } from './memos';
import { describe, expect, test } from 'vitest';
test('memos', function () {
  let counter = 0;

  const m = memos<number, number>(
    (value) => String(value),
    (value) => {
      counter++;
      return value + 100;
    },
  );

  expect(counter).toEqual(0);
  expect(m(1)).toEqual(101);
  expect(counter).toEqual(1);

  expect(m(1)).toEqual(101);
  expect(counter).toEqual(1);

  expect(m(1)).toEqual(101);
  expect(counter).toEqual(1);

  expect(m(2)).toEqual(102);
  expect(counter).toEqual(2);
});

test('mems.reset', function () {
  let counter = 0;

  const m = memos<number, number>(
    (value) => String(value),
    (value) => {
      counter++;
      return value + 100;
    },
  );

  expect(counter).toEqual(0);
  expect(m(1)).toEqual(101);
  expect(counter).toEqual(1);

  expect(m(1)).toEqual(101);
  expect(counter).toEqual(1);

  m.reset();

  expect(m(1)).toEqual(101);
  expect(counter).toEqual(2);

  expect(m(2)).toEqual(102);
  expect(counter).toEqual(3);
});
