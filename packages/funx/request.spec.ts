import { AsyncRequest } from './asyncRequest';

import { describe, expect, it } from 'vitest';

describe(AsyncRequest.name, () => {
  test('resolve', async () => {
    const request = AsyncRequest<number, string>(1);
    expect(request.request).toEqual(1);
    setTimeout(() => request.resolve(`OK-${request.request}`), 0);
    expect(await request.response).toEqual('OK-1');
  });

  test('reject', async () => {
    const request = AsyncRequest<number, string>(1);
    setTimeout(() => request.reject(new Error(`Noop: ${request.request}`)), 0);
    await expect(async () => {
      await request.response;
    }).rejects.toThrow('Noop: 1');
  });

  test('cancel', async () => {
    const request = AsyncRequest<number, string, string>(1, (cancellation) => {
      request.resolve(`>> ${cancellation}`);
    });

    setTimeout(() => request.resolve(`Resolved: ${request.request}`), 100);

    expect(await request.cancelled).toEqual(false);
    request.cancel(`Cancelled: ${request.request}`);

    expect(await request.cancelled).toEqual(true);
    expect(await request.response).toEqual('>> Cancelled: 1');
  });
});
