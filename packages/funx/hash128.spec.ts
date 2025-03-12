import { hash128 } from './hash128';

import { describe, expect, test } from 'vitest';

describe(hash128.name, () => {
  test('hash128', () => {
    expect(hash128({ id: 1 })).toEqual('75579a5625b4794035f51b4b7dff7309');
    expect(hash128({ id: 2 })).toEqual('75579a757a02ec9c33afa36bbecffdb3');
  });
});
