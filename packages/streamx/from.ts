import { StreamX, StreamXLike, StreamXOf } from './index';
import { of } from './of';

export function isStreamXLike(stream: any): stream is StreamXLike<any> {
  return (
    stream != null &&
    ((stream instanceof Object && Symbol.asyncIterator in stream) ||
      (stream instanceof Object && Symbol.iterator in stream))
  );
}

export function toStreamX<Input>(stream: StreamXLike<Input>): StreamX<Input> {
  if (stream instanceof Object && Symbol.asyncIterator in stream) {
    return stream;
  } else if (stream instanceof Object && Symbol.iterator in stream) {
    return (async function* () {
      yield* stream;
    })();
  } else {
    throw new Error(`${typeof stream}, is not iterable`);
  }
}

export function from<Input>(streamLike: StreamXLike<Input>): StreamXOf<Input> {
  return of(toStreamX<Input>(streamLike));
}
