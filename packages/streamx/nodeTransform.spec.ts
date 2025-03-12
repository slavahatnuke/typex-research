import { nodeTransform } from './nodeTransform';
import { Readable, Transform } from 'stream';
import { from } from './from';
import { toArray } from './toArray';
import { of } from './index';

import { describe, expect, it } from 'vitest';

describe(nodeTransform.name, () => {
  it('transform in object mode', async () => {
    const myTransform = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        callback(null, `${chunk} + OK`);
      },
    });

    const stream = from(['Hello Streams']).pipe(
      nodeTransform(myTransform, { objectMode: true }),
    );

    expect(await toArray(stream)).toEqual(['Hello Streams + OK']);
  });

  it('transform in default mode', async () => {
    const myTransform = new Transform({
      transform(chunk: any, encoding, callback) {
        callback(null, `${chunk} + OK`);
      },
    });

    const stream = of(Readable.from('Hello')).pipe(nodeTransform(myTransform));

    const bufferChunks = await toArray(stream);
    expect(bufferChunks).toEqual([
      Buffer.from([72, 101, 108, 108, 111, 32, 43, 32, 79, 75]),
    ]);

    const strings = bufferChunks.map((chunk: any) => chunk.toString());

    expect(strings).toEqual(['Hello + OK']);
  });
});
