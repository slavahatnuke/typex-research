import { PubSub, SyncPubSub, waitForMessage } from './pubsub';
import { delay } from './delay';
import { syncTick, tick } from './tick';
import { expect, it, test } from 'vitest';

test('SyncPub', async function () {
  const topic = SyncPubSub<string>();

  const values: string[] = [];

  const unsubscribe = topic.subscribe((value: string) => values.push(value));

  topic.publish('AAA');
  topic.publish('BBB');

  unsubscribe();
  topic.publish('CCC');

  expect(values).toEqual(['AAA', 'BBB']);
});

test('PubSub', async function () {
  const topic = PubSub<string>();

  const values: string[] = [];

  const unsubscribe = topic.subscribe(async (value: string) => {
    await delay(0);
    values.push(value);
  });

  await topic.publish('AAA');
  await topic.publish('BBB');

  unsubscribe();
  await topic.publish('CCC');

  expect(values).toEqual(['AAA', 'BBB']);
});

test('PubSub / sequent + reversed = false', async function () {
  const topic = PubSub<number>({ sequent: true, reversed: false });

  const values: { value: number; idx: number }[] = [];
  let idx = 0;

  topic.subscribe(async (value) => {
    values.push({ value: value + 10, idx: idx++ });
  });

  topic.subscribe(async (value) => {
    values.push({ value: value + 100, idx: idx++ });
  });

  topic.subscribe(async (value) => {
    values.push({ value: value + 1000, idx: idx++ });
  });

  await topic.publish(1);
  await topic.publish(2);

  expect(values).toEqual([
    {
      idx: 0,
      value: 11,
    },
    {
      idx: 1,
      value: 101,
    },
    {
      idx: 2,
      value: 1001,
    },
    {
      idx: 3,
      value: 12,
    },
    {
      idx: 4,
      value: 102,
    },
    {
      idx: 5,
      value: 1002,
    },
  ]);
});

test('PubSub / sequent + reversed = true', async function () {
  const topic = PubSub<number>({ sequent: true, reversed: true });

  const values: { value: number; idx: number }[] = [];
  let idx = 0;

  topic.subscribe(async function sub1(value) {
    values.push({ value: value + 10, idx: idx++ });
  });

  topic.subscribe(async function sub2(value) {
    values.push({ value: value + 100, idx: idx++ });
  });

  topic.subscribe(async function sub3(value) {
    values.push({ value: value + 1000, idx: idx++ });
  });

  await topic.publish(1);
  await topic.publish(2);

  expect(values).toEqual([
    {
      idx: 0,
      value: 1001,
    },
    {
      idx: 1,
      value: 101,
    },
    {
      idx: 2,
      value: 11,
    },
    {
      idx: 3,
      value: 1002,
    },
    {
      idx: 4,
      value: 102,
    },
    {
      idx: 5,
      value: 12,
    },
  ]);
});

test('PubSub / sequent + error', async function () {
  const topic = PubSub<number>({ sequent: true, reversed: true });

  const values: { value: number; idx: number }[] = [];
  let idx = 0;

  topic.subscribe(async function sub1(value) {
    values.push({ value: value + 10, idx: idx++ });
  });

  topic.subscribe(async function sub2(value) {
    throw new Error(`Wooo ${value}`);
  });

  topic.subscribe(async function sub3(value) {
    values.push({ value: value + 1000, idx: idx++ });
  });

  await expect(async () => {
    await topic.publish(1);
  }).rejects.toThrow('Wooo 1');
});

test('PubSub / sequent + error', async function () {
  const topic = PubSub<number>({ sequent: true, reversed: true });

  const values: { value: number; idx: number }[] = [];
  let idx = 0;

  topic.subscribe(async function sub1(value) {
    values.push({ value: value + 10, idx: idx++ });
  });

  topic.subscribe(async function sub2(value) {
    throw new Error(`Wooo ${value}`);
  });

  topic.subscribe(async function sub3(value) {
    throw new Error(`Wowwww ${value}`);
  });

  await expect(async () => {
    try {
      await topic.publish(1);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect((error as any).errors.length).toEqual(2);
      throw error;
    }
  }).rejects.toThrow('Wowwww 1');
});

test('waitForSubscribe', async () => {
  const topic = PubSub<string>();

  const promise = waitForMessage(topic.subscribe, async (message) => {
    return message === 'abc/ok';
  });

  let resolved: any = 'NULLed';

  syncTick(async () => {
    resolved = await promise;
  });

  await tick(() => {
    expect(resolved).toEqual('NULLed');
  });

  await topic.publish('fooo');

  await tick(() => {
    expect(resolved).toEqual('NULLed');
  });

  await topic.publish('wooo');

  await tick(() => {
    expect(resolved).toEqual('NULLed');
  });

  await topic.publish('abc/ok');

  await tick(() => {
    expect(resolved).toEqual('abc/ok');
  });
});

test('waitForSubscribe / topic as input', async () => {
  const topic = PubSub<string>();

  const promise = waitForMessage(topic, async (message) => {
    return message === 'abc/ok';
  });

  let resolved: any = 'NULLed';

  syncTick(async () => {
    resolved = await promise;
  });

  await tick(() => {
    expect(resolved).toEqual('NULLed');
  });

  await topic.publish('abc/ok');

  await tick(() => {
    expect(resolved).toEqual('abc/ok');
  });
});

test('waitForSubscribe / OK cases', async () => {
  const topic = PubSub<string>();

  const promise = waitForMessage(topic.subscribe, async () => {
    return true;
  });

  let resolved: any = 'NULLed';
  await topic.publish('OK');
  syncTick(async () => {
    resolved = await promise;
  });

  await tick(() => {
    expect(resolved).toEqual('OK');
  });
});
