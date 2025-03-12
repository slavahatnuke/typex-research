import { interval } from './interval';
import { map } from './map';
import { toArray } from './toArray';

import { describe, expect, it } from 'vitest';
import { of } from './of';

describe(interval.name, () => {
  it('startImmediate false (by default)', async function () {
    const source = interval(100);
    let idx = 0;

    const d1 = Date.now();

    const out = of(source).pipe(
      map(() => {
        idx++;

        if (idx > 3) {
          source.stop();
        }

        return idx;
      }),
    );

    const outputs = await toArray(out);

    const d2 = Date.now();

    expect(outputs).toEqual([1, 2, 3, 4]);
    expect(Math.round((d2 - d1) / 100)).toEqual(4);
  });

  it('startImmediate true', async function () {
    const source = interval(100, true);
    let idx = 0;

    const d1 = Date.now();

    const out = of(source).pipe(
      map(() => {
        idx++;

        if (idx > 3) {
          source.stop();
        }

        return idx;
      }),
    );

    const outputs = await toArray(out);

    const d2 = Date.now();

    expect(outputs).toEqual([1, 2, 3, 4]);
    expect(Math.round((d2 - d1) / 100)).toEqual(3);
  });
});
