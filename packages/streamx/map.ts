import { StreamXPromise, StreamX, StreamXMapper } from './index';

export function map<Input, Output>(
  mapper: (input: Input) => StreamXPromise<Output>,
): StreamXMapper<Input, Output> {
  return (inputStream) =>
    (async function* mappedStream(): StreamX<Output> {
      for await (const record of inputStream) {
        yield await mapper(record);
      }
    })();
}
