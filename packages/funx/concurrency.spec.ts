import { Concurrency, keepConcurrency, KeyedConcurrency } from './concurrency';
import { delay } from './delay';
import { tick } from './tick';
import { expect, test } from 'vitest';

const ACCEPTABLE_DEVIATION = 0.2;

test('concurrency / 2', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = Concurrency<string>(2, async (data) => {
    await delay(200);
    counter++;
    return `echo-${data}`;
  });

  await send('1');
  await send('2');

  await send.finish();

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 1).toEqual(
    true,
  );
  expect(counter).toEqual(2);
});

test('concurrency / 1 & results', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = Concurrency<string>(1, async (data) => {
    await delay(200);
    counter++;
    return `echo-${data}`;
  });

  const result1 = await send('1');
  const result2 = await send('2');

  await send.finish();

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 2).toEqual(
    true,
  );
  expect(counter).toEqual(2);

  expect(await result1()).toEqual('echo-1');
  expect(await result2()).toEqual('echo-2');
});

test('concurrency / 2 & 3 messages and back pressure / tested without finishing 3rd message', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = Concurrency<string>(2, async (data) => {
    await delay(200);
    counter++;
    return `echo-${data}`;
  });

  await send('1');
  await send('2');
  await send('3'); // back pressured & no finish

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 1).toEqual(
    true,
  );
  expect(counter).toEqual(1);
});

test('concurrency / 2 & 3 messages and back pressure', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = Concurrency<string>(2, async (data) => {
    counter++;
    await delay(200);
    return `echo-${data}`;
  });

  await send('1');
  await send('2');
  await send('3'); // back pressured & WITH finish

  await send.finish();

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 2).toEqual(
    true,
  );
  expect(counter).toEqual(3);
});

test('concurrency / 2 & 3 messages / quantity and counter', async function () {
  let counter = 0;

  const send = Concurrency<string>(2, async (data) => {
    counter++;
    await delay(200);
    return `echo-${data}`;
  });

  const p1 = send('1'); // uncontrolled
  const p2 = send('2'); // uncontrolled
  const p3 = send('3'); // uncontrolled
  const p4 = send('4'); // uncontrolled
  const p5 = send('5'); // uncontrolled

  expect(send.counter.value()).toEqual(2);
  expect(send.quantity.value()).toEqual(5);

  await Promise.all([p1, p2, p3, p4, p5]);
});

test('keyed concurrency / 2 and undefined key', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = KeyedConcurrency<{ xKey: string | undefined; value: number }>(
    2,
    ({ xKey }) => xKey,
    async (data) => {
      await delay(200);
      counter++;
      return data;
    },
  );

  const result1 = await send({ xKey: undefined, value: 1 });
  const result2 = await send({ xKey: undefined, value: 2 });

  await send.finish();

  const d2 = Date.now();

  // console.log(d2 - d1)
  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION)).toEqual(1);
  expect(counter).toEqual(2);

  expect(await result1()).toEqual({ value: 1, xKey: undefined });
  expect(await result2()).toEqual({ value: 2, xKey: undefined });
});

test('keyed concurrency / 2 and same key', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = KeyedConcurrency<{ xKey: string | undefined; value: number }>(
    2,
    async ({ xKey }) => xKey,

    async (data) => {
      // console.log('worker', {data})
      await delay(200);
      counter++;
      return data;
    },
  );

  const resultResolver1 = await send({ xKey: 'k1', value: 1 });
  const resultResolver2 = await send({ xKey: 'k1', value: 2 });

  await send.finish();

  const d2 = Date.now();

  // console.log(d2 - d1)

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION)).toEqual(2);
  expect(counter).toEqual(2);

  expect(await resultResolver1()).toEqual({ value: 1, xKey: 'k1' });
  expect(await resultResolver2()).toEqual({ value: 2, xKey: 'k1' });
});

test('keyed concurrency / 2 and different keys', async function () {
  const d1 = Date.now();

  let counter = 0;

  const send = KeyedConcurrency<{ xKey: string | undefined; value: number }>(
    2,
    async ({ xKey }) => xKey,

    async (data) => {
      // console.log('worker', {data})
      await delay(200);
      counter++;
      return data;
    },
  );

  const resultResolver1 = await send({ xKey: 'k1', value: 1 });
  const resultResolver2 = await send({ xKey: 'k2', value: 2 });

  await send.finish();

  const d2 = Date.now();

  // console.log(d2 - d1)

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION)).toEqual(1);
  expect(counter).toEqual(2);

  expect(await resultResolver1()).toEqual({ value: 1, xKey: 'k1' });
  expect(await resultResolver2()).toEqual({ value: 2, xKey: 'k2' });
});

test('keepConcurrency / 2', async function () {
  const d1 = Date.now();

  let counter = 0;

  const stop = keepConcurrency(2, async () => {
    counter++;
    await delay(200);
  });

  await tick(async () => {
    await delay(10);
    await stop();
  });

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 1).toEqual(
    true,
  );
  expect(counter).toEqual(2);
});

test('keepConcurrency / 1', async function () {
  const d1 = Date.now();
  let counter = 0;
  const stop = keepConcurrency(1, async () => {
    await delay(200);
    counter++;
  });

  await tick(async () => {
    await delay(10);
    await stop();
  });

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 1).toEqual(
    true,
  );
  expect(counter).toEqual(1);
});

test('keepConcurrency / 20', async function () {
  const d1 = Date.now();

  let counter = 0;

  const stop = keepConcurrency(20, async () => {
    counter++;
    await delay(200);
  });

  await tick(async () => {
    await delay(50);
    await stop();
  });

  const d2 = Date.now();

  expect(Math.floor((d2 - d1) / 200 + ACCEPTABLE_DEVIATION) === 1).toEqual(
    true,
  );
  expect(counter).toEqual(20);
});

test('concurrency / on error', async function () {
  const send = Concurrency<string>(2, async (data) => {
    throw new Error('Woop');
  });

  const resolver1 = await send('1');
  const resolver2 = await send('2');

  await expect(async function () {
    await Promise.all([resolver1(), resolver2()]);
  }).rejects.toThrow('Woop');

  await send.finish();
});

test('keyed concurrency / on error', async function () {
  const send = KeyedConcurrency<{ xKey: string | undefined; value: number }>(
    2,
    async ({ xKey }) => xKey,

    async () => {
      throw new Error(`Woop`);
    },
  );

  const resultResolver1 = await send({ xKey: 'k1', value: 1 });
  const resultResolver2 = await send({ xKey: 'k1', value: 2 });

  await expect(async function () {
    await Promise.all([resultResolver1(), resultResolver2()]);
  }).rejects.toThrow('Woop');

  await send.finish();
});
