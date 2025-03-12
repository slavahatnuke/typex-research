type IUnoPromise<T> = (() => Promise<T>) & {
  reset: () => Promise<void>;
};

export function UnoPromise<T>(fn: () => Promise<T>): IUnoPromise<T> {
  let promise: undefined | Promise<T> = undefined;

  const unoPromise = async () => {
    const hadPromise = !!promise;

    try {
      promise = promise || fn();
      return promise as Promise<T>;
    } finally {
      if (!hadPromise) {
        promise = undefined;
      }
    }
  };

  unoPromise.reset = async () => {
    await promise;
    promise = undefined;
  };

  return unoPromise;
}
