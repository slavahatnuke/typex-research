import { hashHex } from './hash';
import { sortObject } from './sort-object';

export function hash128(input: any) {
  return hashHex(JSON.stringify(sortObject(input)), 128);
}
