import { StreamXPromised, StreamX } from './index';
import { reader } from './reader';

export function loop(condition: () => StreamXPromised<boolean>): StreamX<true> {
  return reader<true>(async () => {
    return (await condition()) ? true : reader.DONE;
  });
}
