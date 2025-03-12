import { isIterable } from './isIterable';

export function flatten<T>(items: T | T[] | Iterable<T>): T[] {
  if (Array.isArray(items) || isIterable(items)) {
    return [...items].reduce((acc, item) => {
      return [...acc, ...flatten(item)];
    }, [] as T[]);
  } else {
    return [items];
  }
}
