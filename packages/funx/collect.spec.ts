import { describe, expect, it } from 'vitest';
import { Collect } from './collect';

describe('collect', () => {
  it('works', () => {

    const numbers = Collect<number>();
    expect(numbers()).toEqual([]);

    numbers(1);
    expect(numbers()).toEqual([1]);
    numbers(2);
    expect(numbers()).toEqual([1, 2]);

  });
});
