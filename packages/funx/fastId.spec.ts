import { describe, expect, test } from 'vitest';
import { fastId, FastIncrementalId } from './fastId';

describe(fastId.name, () => {
  test('generates id', async () => {
    const id = fastId();
    expect(id.length).toBeGreaterThan(5);
  });

  test('generates unique ids', async () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(fastId());
    }
    expect(ids.size).toEqual(1000);
  });
});

describe(FastIncrementalId.name, () => {
  test('generates id', async () => {
    const f1 = FastIncrementalId();
    const f2 = FastIncrementalId();
    expect(f1()).toEqual(0);
    expect(f1()).toEqual(1);
    expect(f1()).toEqual(2);

    expect(f2()).toEqual(0);
    expect(f2()).toEqual(1);
  });

  test('generates unique ids', async () => {
    const NewId = FastIncrementalId();
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(NewId());
    }
    expect(ids.size).toEqual(1000);
  });
});
