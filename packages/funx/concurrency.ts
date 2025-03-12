import { Counter, ICounter } from './counter';
import { Defer, IDefer } from './defer';
import { IValue, Value } from './value';
import { waitForCounter, waitForZeroCounter } from './waitForCounter';

export type IStopKeepConcurrency = () => Promise<void>;

export function keepConcurrency(
  quantity: IValue<number>,
  fn: () => Promise<any>,
): IStopKeepConcurrency {
  const desired = Value<number>(quantity);

  const counter = Counter();
  const unsubscribeCounter = counter.subscribe(handle);

  let stopDefer: undefined | IDefer = undefined;
  let stopping = false;

  function handle() {
    if (stopping) {
      return;
    }

    if (counter.value() < desired()) {
      void (async () => {
        try {
          counter.increment();
          await fn();
        } finally {
          counter.decrement();
        }
      })();
    }
  }

  handle();

  return async function stop() {
    stopping = true;

    if (stopDefer) {
      await stopDefer.promise;
      return;
    }

    stopDefer = stopDefer || Defer();

    if (counter.value() <= 0) {
      stopDefer?.resolve();
    } else {
      const unsubscribe = counter.subscribe(() => {
        if (counter.value() <= 0) {
          stopDefer?.resolve();
          unsubscribe();
        }
      });
    }

    await stopDefer.promise;
    unsubscribeCounter();
  };
}

export type IConcurrencyResultResolver<Output> = () => Promise<Output>;
export type IPublishToConcurrency<Input, Output> = ((
  message: Input,
) => Promise<IConcurrencyResultResolver<Output>>) & {
  finish: () => Promise<void>;
  counter: ICounter; // concurrency counter
  quantity: ICounter; // queued quantity
};

export function Concurrency<T, ReturnType = any>(
  maxConcurrency: IValue<number>,
  worker: (message: T) => Promise<ReturnType>,
): IPublishToConcurrency<T, ReturnType> {
  const max = Value<number>(maxConcurrency);
  const concurrencyCounter = Counter();
  const queuedQuantity = Counter();

  let finishing = false;

  function handle(message: T, defer: IDefer<any>) {
    concurrencyCounter.increment();

    void (async () => {
      try {
        defer.resolve(await worker(message));
      } catch (error) {
        defer.reject(error);
      } finally {
        concurrencyCounter.decrement();
        queuedQuantity.decrement();
      }
    })();
  }

  const canHandle = () => {
    const maximum = max();

    if (!maximum) {
      return true;
    } else {
      return concurrencyCounter.value() < maximum;
    }
  };

  async function tryToHandle(message: T, defer: IDefer<any>) {
    if (canHandle()) {
      handle(message, defer);
    } else {
      await waitForCounter(concurrencyCounter, canHandle);
      void tryToHandle(message, defer);
    }
  }

  const publish = async (message: T) => {
    // if (finishing) {
    //   throw new Error(`Finishing concurrency, publish is not allowed`);
    // }

    const defer = Defer<any>();
    queuedQuantity.increment();

    await tryToHandle(message, defer);

    return async () => defer.promise;
  };

  publish.counter = concurrencyCounter;
  publish.quantity = queuedQuantity;

  publish.finish = async () => {
    finishing = true;
    await waitForZeroCounter(concurrencyCounter);
    concurrencyCounter.reset();
    finishing = false;
  };

  return publish;
}

type IKeyType = string | number | undefined;
type IGetKey<T> = (message: T) => IKeyType | Promise<IKeyType>;
type IKeyedConcurrencyOptions = {
  workerConcurrency: IValue<number>;
};

export function KeyedConcurrency<Input, Output = any>(
  maxConcurrency: IValue<number>,
  getKey: IGetKey<Input>,
  worker: (message: Input) => Promise<Output>,
  // options
  { workerConcurrency = 1 }: Partial<IKeyedConcurrencyOptions> = {},
): IPublishToConcurrency<Input, Output> {
  const registry: {
    [key in string | number]: IPublishToConcurrency<Input, Output>;
  } = {};

  return Concurrency<Input>(maxConcurrency, async (message: Input) => {
    const key = await getKey(message);

    if (key === undefined) {
      return worker(message);
    } else {
      if (!registry[key]) {
        const keyedControl = Concurrency<Input>(workerConcurrency, worker);
        registry[key] = keyedControl;

        const unsubscribe = keyedControl.quantity.subscribe((value) => {
          if (value <= 0) {
            unsubscribe();

            if (registry[key]) {
              delete registry[key];
            }
          }
        });
      }

      const resolver = await registry[key](message);
      return await resolver();
    }
  });
}
