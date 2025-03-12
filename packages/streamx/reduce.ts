import { StreamXPromised, StreamX, StreamXMapper } from './index';

export function reduce<Input, Accumulator>(
  reducer: (accumulator: Accumulator, input: Input) => StreamXPromised<Accumulator>,
  initial: Accumulator,
): StreamXMapper<Input, Accumulator> {
  return (inputStream) =>
    (async function* reduced(): StreamX<Accumulator> {
      let finalValue: Accumulator = initial;
      for await (const input of inputStream) {
        finalValue = await reducer(finalValue, input);
      }
      yield finalValue;
    })();
}
