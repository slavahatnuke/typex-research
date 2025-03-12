import { hash256 } from './hash256';

import { describe, expect, test } from 'vitest';

describe(hash256.name, () => {
  test('hash256', () => {
    expect(hash256({ id: 1 })).toEqual(
      '75579a5625b4794035f51b4b7dff73093ca0f3b44a72fd475a1613655c583fd1',
    );
    expect(hash256({ id: 2 })).toEqual(
      '75579a757a02ec9c33afa36bbecffdb33e79cb142b06fdb5bc6a0f564c555065',
    );
  });
});
