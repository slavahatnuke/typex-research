import { IPubSubSubscribe, SyncPubSub } from './pubsub';

export type ICounter = {
  increment: (n?: number) => number;
  decrement: (n?: number) => number;
  value: () => number;
  subscribe: IPubSubSubscribe<number>;
  reset: () => void;
};

export function Counter(): ICounter {
  const topic = SyncPubSub<number>();
  const { subscribe, publish } = topic;

  let counter = 0;

  function increment(n = 1) {
    counter += n;
    publish(counter);
    return counter;
  }

  function decrement(n = 1) {
    counter -= n;
    publish(counter);
    return counter;
  }

  function value() {
    return counter;
  }

  function reset() {
    counter = 0;
    publish(0);
  }

  return {
    increment,
    decrement,
    value,
    subscribe,
    reset,
  };
}
