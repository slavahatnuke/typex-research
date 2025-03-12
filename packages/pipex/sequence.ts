import { StreamX } from './index';

export async function* sequence(length: number): StreamX<number> {
  for (let i = 0; i < length; i++) {
    yield i;
  }
}
