import { StreamXPromised, StreamX, StreamXMapper } from './index';

export function filter<Input>(
  condition: (input: Input) => StreamXPromised<boolean | undefined | null>,
): StreamXMapper<Input, Input> {
  return (inputStream) =>
    (async function* filtered(): StreamX<Input> {
      for await (const record of inputStream) {
        if (await condition(record)) {
          yield record;
        }
      }
    })();
}
