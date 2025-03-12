import { StreamXMapper } from './index';
import { Readable, ReadableOptions, Transform } from 'stream';
import { of } from './of';

export function nodeTransform<Input, Output>(
  transform: Transform,
  options: ReadableOptions = {},
): StreamXMapper<Input, Output> {
  return (inputStream) =>
    of(Readable.from(inputStream, options).pipe(transform));
}
