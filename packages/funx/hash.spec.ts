import { HashBalance, hashCode, hashCodeNative, hashHex } from './hash';

import { expect, test, vi, it } from 'vitest';

test('todo hash', async () => {
  // TODO @@@@slava hash tests
  expect(true).toEqual(true);
});

test('hashCodeNative', async () => {
  expect(hashCodeNative('1234')).toEqual(1509442);
  expect(hashCodeNative('321')).toEqual(50610);
});

test('hashHex', async () => {
  expect(hashHex('1234', 256)).toEqual(
    '2bb7072713946d75a7694097dc9e40431c7b35467dabc79212dcdd96394bf602',
  );
  expect(hashHex('1234', 512)).toEqual(
    '2bb7072713946d75a7694097dc9e40431c7b35467dabc79212dcdd96394bf602ec292106baed62b46cddacd7448cb9d685f8f124506f83a783e11cc4ff446e72',
  );

  expect(hashHex('321', 512)).toEqual(
    '16978234f1bd4453b8cf6e57ee55e7522f70562cf16df252da8ba75f84454263c5b0b59dc049a51e2a11c1fceb21918a05d9e69166cff25a736fa51d73e57514',
  );
  expect(hashHex('321', 128)).toEqual('16978234f1bd4453b8cf6e57ee55e752');
});

test('HashBalance', async () => {
  const balance = HashBalance(hashCode);
  expect(balance('A', 3)).toEqual(2);
  expect(balance('B', 3)).toEqual(0);
  expect(balance('C', 3)).toEqual(1);
});
