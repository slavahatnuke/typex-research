import { Defer, IDefer } from './defer';

export type IFinishInterval = () => Promise<void>;

export function Interval(
  fn: () => any | Promise<any>,
  timeWindow: number,
  startImmediately = false,
): IFinishInterval {
  let finishing = false;
  let finished = false;
  let finishingDefer: IDefer<void> | undefined = undefined;
  let delayDefer: IDefer<void> = Defer<void>();
  let timer: any;

  function clearTimerIfExists() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  async function execute() {
    if (!finishing) {
      await fn();
    }

    if (finishingDefer) {
      finishingDefer.resolve();
    }

    clearTimerIfExists();

    if (finishing) {
      finished = true;
    }
  }

  void (async () => {
    if (startImmediately) {
      await execute();
    }

    while (!finishing) {
      // delay
      delayDefer.resolve();
      delayDefer = Defer<void>();
      // eslint-disable-next-line no-loop-func
      timer = setTimeout(() => delayDefer.resolve(), timeWindow);
      await delayDefer.promise;

      // execution
      await execute();
    }
  })();

  return async () => {
    finishing = true;

    if (!finishingDefer) {
      finishingDefer = Defer<void>();
    }

    if (finished) {
      finishingDefer.resolve();
    }

    if (delayDefer) {
      delayDefer.resolve();
    }

    clearTimerIfExists();

    await finishingDefer.promise;
  };
}
