import { map } from './map';
import { StreamXPromise, StreamXMapper } from './index';

export function tap<Input>(
  fn: (input: Input) => StreamXPromise<any>,
): StreamXMapper<Input, Input> {
  return map<Input, Input>(async (input): Promise<Input> => {
    await fn(input);
    return input;
  });
}
