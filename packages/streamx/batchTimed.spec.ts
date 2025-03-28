import { batchTimed } from './batchTimed';
import { sequence } from './sequence';
import { tap } from './tap';
import { delay } from '@slavax/funx/delay';
import { toArray } from './toArray';

import { describe, expect, it } from 'vitest';
import { of } from './of';

describe(batchTimed.name, () => {
  it('batched by size', async () => {
    const stream = of(sequence(5))
      .pipe(
        tap(() => {
          return delay(10);
        }),
      )
      .pipe(batchTimed(2, 500));

    const outputs = await toArray(stream);

    expect(outputs).toEqual([[0, 1], [2, 3], [4]]);
  });

  it('batched by time', async () => {
    const stream = of(sequence(5))
      .pipe(
        tap(() => {
          return delay(100);
        }),
      )
      .pipe(batchTimed(2, 10));

    const outputs = await toArray(stream);

    expect(outputs).toEqual([[0], [1], [2], [3], [4]]);
  });
});
