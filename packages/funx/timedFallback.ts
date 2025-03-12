import { Defer } from './defer';

export type MayBeAsync<Type = any> = Type | Promise<Type>;

type ITimedFallback<Target = any, Fallback = any> = (
  resolver: () => MayBeAsync<Target>,
) => Promise<Target | Fallback>;

export function TimedFallback<Target, Fallback = Target>(
  timeout: number,
  fallback: () => MayBeAsync<Fallback>,
): ITimedFallback<Target, Fallback> {
  return async (resolver: () => MayBeAsync<Target>) => {
    const defer = Defer<Target | Fallback>();

    const timerRef = setTimeout(async function () {
      try {
        defer.resolve(await fallback());
      } catch (error) {
        defer.reject(error);
      }
    }, timeout);

    setTimeout(async () => {
      try {
        const result = await resolver();
        clearTimeout(timerRef);
        defer.resolve(result);
      } catch (error) {
        clearTimeout(timerRef);
        defer.reject(error);
      }
    }, 0);

    return defer.promise;
  };
}
