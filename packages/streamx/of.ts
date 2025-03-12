// of
import { StreamX, StreamXMapper, StreamXOf } from './index';

export function of<Input>(inputStream: StreamX<Input>): StreamXOf<Input> {
  return {
    [Symbol.asyncIterator]: () => inputStream[Symbol.asyncIterator](),
    pipe<Output>(mapper: StreamXMapper<Input, Output>): StreamXOf<Output> {
      return of(mapper(inputStream));
    },
  };
}