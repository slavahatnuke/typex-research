import { Defer, DeferData } from './defer';

import { describe, expect, test } from 'vitest';

test('defer', async function () {
  const defer = Defer<string>();

  expect(defer.pending).toEqual(true);
  expect(defer.resolved).toEqual(false);
  expect(defer.rejected).toEqual(false);

  setTimeout(() => defer.resolve('OK123'), 0);
  const result = await defer.promise;

  expect(result).toEqual('OK123');

  expect(defer.pending).toEqual(false);
  expect(defer.resolved).toEqual(true);
  expect(defer.rejected).toEqual(false);
});

test('defer / reject', async function () {
  const defer = Defer<string>();

  expect(defer.pending).toEqual(true);
  expect(defer.resolved).toEqual(false);
  expect(defer.rejected).toEqual(false);

  setTimeout(() => defer.reject(new Error('err12345')), 0);
  await expect(async () => await defer.promise).rejects.toThrow('err12345');

  expect(defer.pending).toEqual(false);
  expect(defer.resolved).toEqual(false);
  expect(defer.rejected).toEqual(true);
});

test('DeferData / only defer', async function () {
  const deferData = DeferData<string>('someData-here');

  setTimeout(() => deferData.resolve(), 0);
  expect(await deferData.promise).toEqual(undefined);
  expect(deferData.data).toEqual('someData-here');
});

test('DeferData with defer data', async function () {
  const deferData = DeferData<string, number>('someData-here-2');

  setTimeout(() => deferData.resolve(200), 0);
  expect(await deferData.promise).toEqual(200);
  expect(deferData.data).toEqual('someData-here-2');
});
