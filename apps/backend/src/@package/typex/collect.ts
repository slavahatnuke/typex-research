export type ICollect<T> = (...args: T[]) => T[];

export function Collect<T>(): ICollect<T> {
  const records: T[] = [];

  return function (...args: T[]) {
    if (args.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      records.push(args[0]!);
    }

    return records;
  };
}
