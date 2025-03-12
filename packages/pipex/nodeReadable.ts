import { of, StreamXOf } from './index';
import { Readable } from 'stream';

export function nodeReadable<Output>(
  readable: Readable,
): StreamXOf<Output> {
  return of<Output>(readable);
}
