import { flat } from './flat';
import { map } from './map';
import { pipe, StreamXPromise, StreamXLike, StreamXMapper } from './index';

export function flatMap<Input, Output>(
  mapper: (input: Input) => StreamXPromise<Output | StreamXLike<Output>>,
): StreamXMapper<Input, Output> {
  return pipe(map(mapper)).pipe(flat());
}
