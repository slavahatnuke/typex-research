export function isIterable(input: any): input is Iterable<any> {
  return input != null && typeof (input as any)[Symbol.iterator] === 'function';
}
