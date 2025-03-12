import { IMem, mem } from './mem';

export type IMemos<Input, Output> = ((value: Input) => Output) & {
  reset: () => void;
};

export function memos<Input, Output>(
  toKey: (value: Input) => string | number,
  toValue: (value: Input) => Output,
): IMemos<Input, Output> {
  let cache: { [P in string | number]: IMem<Output> } = {};

  const iMemos = (value: Input) => {
    const key = toKey(value);
    cache[key] = key in cache ? cache[key] : mem<Output>(() => toValue(value));

    return cache[key]();
  };

  iMemos.reset = () => {
    Object.values(cache).forEach((mem) => mem.reset());
    cache = {};
  };

  return iMemos;
}
