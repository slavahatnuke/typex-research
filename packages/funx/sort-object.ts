// TODO @@@@slava move to fun lib

const jsonStringify = (x: any): string => JSON.stringify(x);
const stringSorter = (a: string, b: string): number => a.localeCompare(b);

export function SortObject({
  sortIterable = true,
  stringify = jsonStringify,
  sorter = stringSorter,
} = {}) {
  return function sortObject(input: any): any {
    if (
      Array.isArray(input) ||
      (input instanceof Object && input[Symbol.iterator])
    ) {
      if (sortIterable) {
        return [...input]
          .map(sortObject)
          .map((item) => ({ item, value: stringify(item) }))
          .sort((a, b) => sorter(a.value, b.value))
          .map(({ item }) => item);
      } else {
        return [...input].map(sortObject);
      }
    }

    if (input instanceof Object) {
      const result: any = {};

      Object.keys(input)
        .sort(sorter)
        .forEach((key) => (result[key] = sortObject(input[key])));

      return result;
    }

    return input;
  };
}

export const sortObject = SortObject();

export function DeepEqual({
  sort = sortObject,
  stringify = jsonStringify,
} = {}) {
  return function (a: any, b: any) {
    return stringify(sort(a)) === stringify(sort(b));
  };
}

export const deepEqual = DeepEqual();
