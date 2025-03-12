import { hashHex } from './hash';
import { sortObject } from './sort-object';

export function hash256(input: any) {
  return hashHex(JSON.stringify(sortObject(input)), 256);
}
