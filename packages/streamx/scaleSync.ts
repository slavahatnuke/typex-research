import { StreamXPromise, StreamXMapper } from './index';
import { batch } from './batch';
import { map } from './map';
import { flat } from './flat';
import { pipe } from './pipe';

export function scaleSync<Input, Output>(
  size: number,
  mapper: (input: Input) => StreamXPromise<Output>,
): StreamXMapper<Input, Output> {
  return pipe(batch<Input>(size))
    .pipe(map((values) => Promise.all(values.map(mapper))))
    .pipe(flat());
}
