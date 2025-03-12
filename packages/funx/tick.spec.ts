import { syncTick as syncTick, tick as tick } from './tick';
import { Defer } from './defer';
import { delay } from './delay';

test('syncTick', async function () {
  const defer = Defer<boolean>();
  let ticked = false;

  syncTick(() => {
    defer.resolve(true);
    ticked = true;
  });

  await defer.promise;

  expect(ticked).toEqual(true);
});

test('tick', async function () {
  let ticked = false;
  const d1 = Date.now();

  await tick(async () => {
    await delay(200);
    ticked = true;
  });

  const d2 = Date.now();

  expect(Math.round((d2 - d1) / 200)).toEqual(1);
  expect(ticked).toEqual(true);
});

test('tick error', async function () {
  let ticked = false;

  await expect(async () => {
    await tick(async () => {
      await delay(200);
      ticked = true;
      throw new Error(`woop`);
    });
  }).rejects.toThrowError(`woop`);

  expect(ticked).toEqual(true);
});
