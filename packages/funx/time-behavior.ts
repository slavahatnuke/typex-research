import { IValue, Value } from './value';

export function throttleTrailing<T>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  fn: Function,
  ms: IValue<number>,
): () => void {
  let scheduled = false;
  let calledAfterScheduling = false;
  const delayMs = Value<number>(ms);

  const aThrottle = () => {
    if (scheduled) {
      calledAfterScheduling = true;
      return;
    }

    scheduled = true;

    setTimeout(() => {
      try {
        fn();
      } catch {
      } finally {
        scheduled = false;

        if (calledAfterScheduling) {
          calledAfterScheduling = false;
          aThrottle();
        }
      }
    }, delayMs());
  };

  return aThrottle;
}

export function debounceTrailing<T>(
  fn: () => any,
  ms: IValue<number>,
): () => void {
  const delayMs = Value<number>(ms);

  let timer: any;

  return () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    timer = setTimeout(() => {
      timer = undefined;
      fn();
    }, delayMs());
  };
}
