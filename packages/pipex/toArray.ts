import { StreamX } from './index';

export async function toArray<T>(input: StreamX<T>): Promise<T[]> {
  const values: T[] = [];
  for await (const value of input) {
    values.push(value);
  }
  return values;
}
