import { flat } from './flat';
import { map } from './map';
import { StreamXPromise, StreamXLike, StreamXMapper } from './index';
import { pipe } from './pipe';

export function flatMap<Input, Output>(
  mapper: (input: Input) => StreamXPromise<Output | StreamXLike<Output>>,
): StreamXMapper<Input, Output> {
  return pipe(map(mapper)).pipe(flat());
}
