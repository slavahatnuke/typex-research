import { Defer } from '@slavax/funx/defer';
import { reader } from './reader';
import { StreamX } from './index';

export type IInterval = StreamX<number> & {
  stop: () => void;
};

export function interval(ms: number, startImmediate = false): IInterval {
  let point = startImmediate ? null : Date.now();

  let delayDefer = Defer<void>();
  delayDefer.resolve();

  let delayTimer: any;
  let stopped = false;

  const intervalStream = reader<number>(async () => {
    if (stopped) {
      return reader.DONE;
    }

    const now = Date.now();

    if (!point) {
      point = now;
      return now;
    }

    const xDelay = now - point;

    if (xDelay < ms) {
      delayDefer = Defer<void>();
      const delayTimeout = ms - xDelay;
      delayTimer = setTimeout(() => delayDefer.resolve(), delayTimeout);
      await delayDefer.promise;

      if (stopped) {
        return reader.DONE;
      }
    }

    point = Date.now();

    return point;
  }) as IInterval;

  intervalStream.stop = () => {
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = undefined;
    }
    stopped = true;
    delayDefer.resolve();
  };

  return intervalStream;
}
