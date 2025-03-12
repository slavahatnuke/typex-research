import { ICounter } from './counter';
import { waitForMessage } from './pubsub';

export async function waitForCounter(
  counter: ICounter,
  isTrue: (counter: ICounter) => boolean,
): Promise<void> {
  if (!isTrue(counter)) {
    await waitForMessage(counter.subscribe, () => isTrue(counter));
  }
}

export async function waitForZeroCounter(counter: ICounter) {
  return waitForCounter(counter, (counter) => counter.value() <= 0);
}
