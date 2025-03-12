import { StreamXMapper } from './index';
import { tap } from './tap';

export function relaxedTimeout<Input>(): StreamXMapper<Input, Input> {
  return tap<Input>(() => new Promise((resolve) => setTimeout(resolve, 0)));
}
