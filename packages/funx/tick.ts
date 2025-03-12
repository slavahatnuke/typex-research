import { Defer } from './defer';

type ITickSyncRunner = () => any;
type ITickRunner = () => Promise<any> | any;

export type ITick = (fn: ITickSyncRunner) => void;

function isObject(x: any) {
  return x instanceof Object;
}

function isFunction(x: any) {
  return x instanceof Function;
}

export function SyncTick(): ITick {
  return (fn: ITickSyncRunner) => {
    setTimeout(fn, 0);
  };
}

export const syncTick = SyncTick();

export async function tick(fn: ITickRunner) {
  const defer = Defer();

  syncTick(async () => {
    try {
      await fn();
      defer.resolve();
    } catch (e) {
      defer.reject(e);
    }
  });

  await defer.promise;
}
