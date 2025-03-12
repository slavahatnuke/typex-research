import { prettyJson } from './prettyJson';

import { describe, expect, test } from 'vitest';

describe(prettyJson.name, () => {
  test('prettyJson', () => {
    expect(prettyJson({ a: 1 })).toEqual(
      `
{
  "a": 1
}    
    `.trim(),
    );
  });
});
