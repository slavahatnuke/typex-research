import { map } from './map';
import { StreamXPromised, StreamXMapper } from './index';

export function tap<Input>(
  fn: (input: Input) => StreamXPromised<any>,
): StreamXMapper<Input, Input> {
  return map<Input, Input>(async (input): Promise<Input> => {
    await fn(input);
    return input;
  });
}
