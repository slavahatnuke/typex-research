import { expect, test } from 'vitest';
import { SpeedTest } from './speed-test';
import { Collect } from './collect';

test(SpeedTest, async () => {
  const reports = Collect();

  const speedTest = SpeedTest({ every: 10, publishReport: reports });

  for (let i = 0; i < 30; i++) {
    speedTest.track();
  }

  expect(reports().length).toEqual(3);
});
