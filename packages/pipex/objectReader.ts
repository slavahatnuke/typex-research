import { StreamXPromised, StreamX } from './index';
import { reader } from './reader';

export function objectReader<T extends object | object[]>(
  read: () => StreamXPromised<T | null | undefined | boolean | number>,
): StreamX<T> {
  return reader<T>(async () => {
    const object = await read();

    if (object instanceof Object) {
      return object;
    }

    return reader.DONE;
  });
}
