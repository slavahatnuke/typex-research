import { prettyJson } from './prettyJson';

import { describe, expect, it } from 'vitest';

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
