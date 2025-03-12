import { Counter } from './counter';
import { waitForCounter, waitForZeroCounter } from './waitForCounter';
import { delay } from './delay';

import { describe, expect, test } from 'vitest';

describe(waitForZeroCounter, () => {
  test('waitForCounter / initial', async function () {
    const counter1 = Counter();
    await waitForCounter(counter1, (counter) => counter.value() <= 0);
  });

  test('waitForCounter / by decrement', async function () {
    const counter2 = Counter();
    counter2.increment(2);

    let resolved = false;
    const p1 = waitForCounter(counter2, (counter) => counter.value() <= 0);
    void p1.then(() => (resolved = true));

    counter2.decrement();
    await delay(100);

    expect(counter2.value()).toEqual(1);
    expect(resolved).toEqual(false);

    counter2.decrement();
    await delay(100);

    expect(counter2.value()).toEqual(0);
    expect(resolved).toEqual(true);
  });

  test(waitForZeroCounter.name, async function () {
    const counter2 = Counter();
    counter2.increment(2);

    let resolved = false;
    const p1 = waitForZeroCounter(counter2);
    void p1.then(() => (resolved = true));

    counter2.decrement();
    await delay(100);

    expect(counter2.value()).toEqual(1);
    expect(resolved).toEqual(false);

    counter2.decrement();
    await delay(100);

    expect(counter2.value()).toEqual(0);
    expect(resolved).toEqual(true);
  });
});
