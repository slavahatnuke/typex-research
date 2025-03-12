export type ITimerInterface = {
  start(fn: () => any): void;
  stop(): void;
};

export function Timer(timeout: number | undefined | null): ITimerInterface {
  let ref: any;

  function start(fn: () => any) {
    if (ref) {
      stop();
    }

    if (Number.isInteger(timeout)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ref = setTimeout(fn, timeout!);
    }
  }

  function stop() {
    if (ref) {
      clearTimeout(ref);
    }
    ref = null;
  }

  return {
    start,
    stop,
  };
}
