import { flat } from './flat';
import { map } from './map';
import { pipe, StreamXPromised, StreamXLike, StreamXMapper } from './index';

export function flatMap<Input, Output>(
  mapper: (input: Input) => StreamXPromised<Output | StreamXLike<Output>>,
): StreamXMapper<Input, Output> {
  return pipe(map(mapper)).pipe(flat());
}
