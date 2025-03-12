export type IMem<T> = (() => T) & {
  reset: () => void;
};

export function mem<T>(fn: () => T): IMem<T> {
  let value: any = undefined;
  let called = false;

  const iMem = () => {
    if (called) {
      return value;
    }

    value = fn();
    called = true;

    return value;
  };

  iMem.reset = () => {
    value = undefined;
    called = false;
  };

  return iMem;
}
