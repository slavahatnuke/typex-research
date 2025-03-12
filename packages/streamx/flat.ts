import { StreamX, StreamXLike, StreamXMapper } from './index';

export function flat<Type>(): StreamXMapper<
  Type | StreamXLike<Type>,
  Type
> {
  return (inputStream) =>
    (async function* flatStream(): StreamX<Type> {
      for await (const record of inputStream) {
        if (
          record instanceof Object &&
          (Array.isArray(record) ||
            Symbol.iterator in record ||
            Symbol.asyncIterator in record)
        ) {
          for await (const element of record) {
            yield element;
          }
        } else {
          yield record;
        }
      }
    })();
}
