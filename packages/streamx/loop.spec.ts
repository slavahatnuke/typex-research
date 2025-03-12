import { loop } from './loop';
import { delay } from '@slavax/funx/delay';
import { toArray } from './toArray';
import { map } from './map';

import { describe, expect, it } from 'vitest';
import { of } from './of';

describe(loop.name, () => {
  it('test', async function () {
    let idx = 0;

    const loopStream = of(
      loop(async () => {
        await delay(10);
        idx++;
        return idx < 5;
      }),
    ).pipe(map(() => idx));

    const outputs = await toArray(loopStream);
    expect(idx).toEqual(5);
    expect(outputs).toEqual([1, 2, 3, 4]);
  });
});
