import { StreamXPromise, StreamX } from './index';
import { reader } from './reader';

export function loop(condition: () => StreamXPromise<boolean>): StreamX<true> {
  return reader<true>(async () => {
    return (await condition()) ? true : reader.DONE;
  });
}
