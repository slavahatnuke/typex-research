import { regExpEscape } from './regexp-escape';

import { describe, expect, it } from 'vitest';

describe('regExpEscape', () => {
  test('properly escapes regex characters', () => {
    const value = 'Somebody-Someone@test.com';
    const regex = new RegExp(`^${regExpEscape(value)}$`, 'i');
    const result = regex.test(value.toLowerCase());
    expect(result).toBeTruthy();
  });
});
