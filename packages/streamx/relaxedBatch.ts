import { StreamXMapper } from './index';
import { pipe } from './pipe';
import { relaxedTimeout } from './relaxedTimeout';
import { batch } from './batch';
import { flat } from './flat';

export function relaxedBatch<Input>(
  batchSize: number = 100,
): StreamXMapper<Input, Input> {
  return pipe(batch<Input>(batchSize)).pipe(relaxedTimeout()).pipe(flat());
}
