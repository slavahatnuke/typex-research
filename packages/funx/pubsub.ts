import { Defer } from './defer';

export type ISyncPubSub<T> = {
  publish: (message: T) => void;
  subscribe: IPubSubSubscribe<T>;
  unsubscribeAll: () => void;
};

export type IPubSubSubscribe<T> = (
  subscriber: IPubSubSubscriber<T>,
) => IPubSubUnsubscribe;
export type IPubSubPublish<T> = (message: T) => Promise<void>;

export type IPubSub<T> = {
  publish: IPubSubPublish<T>;
  subscribe: IPubSubSubscribe<T>;
  unsubscribeAll: () => void;
};

export type IPubSubSubscriber<T> = (message: T) => any;
export type IPubSubUnsubscribe = () => void | any;

export function SyncPubSub<T>(): ISyncPubSub<T> {
  let subscribers: IPubSubSubscriber<T>[] = [];

  function subscribe(subscriber: (value: T) => void) {
    subscribers.push(subscriber);
    return () => unsubscribe(subscriber);
  }

  function unsubscribe(subscriber: IPubSubSubscriber<T>) {
    subscribers = subscribers.filter((sub) => sub !== subscriber);
  }

  function publish(value: T) {
    subscribers.map((sub) => sub(value));
  }

  function unsubscribeAll() {
    subscribers = [];
  }

  return {
    publish,
    subscribe,
    unsubscribeAll,
  };
}

export class PubSubAggregateError extends Error {
  constructor(
    public errors: Error[],
    message?: string,
  ) {
    super(message);

    const error = errors[0] || ({} as any);

    this.message = message || error.message || '';
    this.stack = error.stack || '';
  }
}

export function PubSub<T>({
  sequent = false,
  reversed = false,
} = {}): IPubSub<T> {
  let subscribers: IPubSubSubscriber<T>[] = [];

  function subscribe(subscriber: (value: T) => void) {
    subscribers.push(subscriber);
    return () => unsubscribe(subscriber);
  }

  function unsubscribe(subscriber: IPubSubSubscriber<T>) {
    subscribers = subscribers.filter((sub) => sub !== subscriber);
  }

  async function publish(message: T) {
    if (sequent) {
      const errors: Error[] = [];

      const subs = reversed ? [...subscribers].reverse() : subscribers;

      for (const sub of subs) {
        try {
          await sub(message);
        } catch (error) {
          errors.push(error as Error);
        }
      }

      if (errors.length) {
        if (errors.length === 1) {
          throw errors[0];
        } else {
          throw new PubSubAggregateError(errors);
        }
      }
    } else {
      await Promise.all(subscribers.map((sub) => sub(message)));
    }
  }

  function unsubscribeAll() {
    subscribers = [];
  }

  return {
    publish,
    subscribe,
    unsubscribeAll,
  };
}

export async function waitForMessage<T>(
  subscribe: IPubSubSubscribe<T> | IPubSub<T>,
  isAcceptable: (message: T) => boolean | Promise<boolean>,
): Promise<T> {
  const defer = Defer<T>();
  if ('subscribe' in subscribe) {
    subscribe = subscribe.subscribe;
  }

  const unsubscribe = subscribe(async (message: T) => {
    try {
      if (await isAcceptable(message)) {
        unsubscribe();
        defer.resolve(message);
      }
    } catch (error) {
      unsubscribe();
      defer.reject(error);
    }
  });

  return defer.promise;
}
