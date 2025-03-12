import { TimedFallback } from './timedFallback';
import { delay } from './delay';

import { expect, test, vi, it } from 'vitest';

test('TimedFallback', async () => {
  const handleCase = TimedFallback<string, string>(300, () => 'Took too long');
  const result1 = await handleCase(async () => {
    await delay(10);
    return 'OK';
  });

  expect(result1).toEqual('OK');

  const result2 = await handleCase(async () => {
    await delay(500);
    return 'OK';
  });

  expect(result2).toEqual('Took too long');
});

test('TimedFallback / error', async () => {
  const handleCase = TimedFallback<string, string>(300, () => 'Took too long');

  await expect(async () => {
    await handleCase(async () => {
      await delay(10);
      throw new Error('Woops');
    });
  }).rejects.toThrowError('Woops');

  const result2 = await handleCase(async () => {
    await delay(500);
    throw new Error('Woops2');
  });

  expect(result2).toEqual('Took too long');
});

test('timedFallback / fallback error', async () => {
  const handleCase = TimedFallback<string, string>(300, () => {
    throw new Error('Fallback Foooo');
  });

  await expect(async () => {
    await handleCase(async () => {
      await delay(10);
      throw new Error('Woops');
    });
  }).rejects.toThrowError('Woops');

  await expect(async () => {
    await handleCase(async () => {
      await delay(500);
      throw new Error('Woops');
    });
  }).rejects.toThrowError('Fallback Foooo');
});
