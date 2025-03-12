import { of, StreamX, StreamXLike, StreamXOf } from './index';

export function isStrictStreamLike(
  stream: any,
): stream is StreamXLike<any> {
  return (
    stream != null &&
    ((stream instanceof Object && Symbol.asyncIterator in stream) ||
      (stream instanceof Object && Symbol.iterator in stream))
  );
}

export function toStrictStream<Input>(
  stream: StreamXLike<Input>,
): StreamX<Input> {
  if (stream instanceof Object && Symbol.asyncIterator in stream) {
    return stream;
  } else if (stream instanceof Object && Symbol.iterator in stream) {
    return {
      [Symbol.asyncIterator]: () => {
        const syncIterator = stream[Symbol.iterator]();
        return {
          next: async () => syncIterator.next(),
        };
      },
    };
  } else {
    throw new Error(`${typeof stream}, is not iterable`);
  }
}

export function from<Input>(
  streamLike: StreamXLike<Input>,
): StreamXOf<Input> {
  return of(toStrictStream<Input>(streamLike));
}
