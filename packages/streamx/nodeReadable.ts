import { StreamXOf } from './index';
import { Readable } from 'stream';
import { of } from './of';

export function nodeReadable<Output>(
  readable: Readable,
): StreamXOf<Output> {
  return of<Output>(readable);
}
