import { StreamX } from './index';

export function concatenate<T>(...streams: StreamX<T>[]): StreamX<T>;

export function concatenate<T1, T2, T3, T4, T5>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
  stream3: StreamX<T3>,
  stream4: StreamX<T4>,
  stream5: StreamX<T5>,
): StreamX<T1 | T2 | T3 | T4 | T5>;
export function concatenate<T1, T2, T3, T4>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
  stream3: StreamX<T3>,
  stream4: StreamX<T4>,
): StreamX<T1 | T2 | T3 | T4>;
export function concatenate<T1, T2, T3>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
  stream3: StreamX<T3>,
): StreamX<T1 | T2 | T3>;
export function concatenate<T1, T2>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
): StreamX<T1 | T2>;
export function concatenate<T>(
  ...streams: StreamX<any>[]
): StreamX<T> {
  return (async function* concatenateStreams(): StreamX<T> {
    for await (const stream of streams) {
      yield* stream;
    }
  })();
}
