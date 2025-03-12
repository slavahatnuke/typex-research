export function toArray<T>(value: T | Array<T> | ReadonlyArray<T>): T[] {
  return (Array.isArray(value) ? value : [value]) as T[];
}

export function toNonEmptyArray<T>(
  value: T | Array<T> | ReadonlyArray<T> | null,
): T[] {
  return toArray(value).filter((x) => !!x) as T[];
}

export function Exclude(toExclude: string[]) {
  return function (payload: object) {
    const out = { ...payload };

    toExclude.forEach((column) => {
      if (column in out) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete out[column];
      }
    });

    return out;
  };
}

const PickNullByDefault = (column: string): any => null;

export function Pick(
  toPick: string[],
  defaultMapper: null | typeof PickNullByDefault = PickNullByDefault,
) {
  return function (payload: object) {
    const out = {};

    toPick.forEach((column) => {
      if (column in payload) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        out[column] = payload[column];
      } else if (defaultMapper instanceof Function) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        out[column] = defaultMapper(column);
      }
    });

    return out;
  };
}

type IGroupByResult<T, KType extends keyof any> = Record<KType, T[]>;
type IGroupByIdentifier<T, KType extends keyof any = any> = (v: T) => KType;

export function groupBy<T, KType extends keyof any = any>(
  values: ReadonlyArray<T>,
  identify: IGroupByIdentifier<T, KType>,
): IGroupByResult<T, KType> {
  return values.reduce(
    (a, v) => {
      const key = identify(v);
      a[key] = a[key] || [];
      a[key].push(v);
      return a;
    },
    {} as IGroupByResult<T, KType>,
  );
}

type IIdentifyBy<T> = (item: T) => any;

export function hashMapBy<T extends object>(
  values: T[],
  identify: (item: T) => any,
): Partial<{ [P in any]: T }> {
  return values.reduce(
    (hashMap, item) => {
      hashMap[identify(item)] = item;
      return hashMap;
    },
    {} as Partial<{ [P in any]: T }>,
  );
}

export function uniqBy<T extends object>(
  values: T[],
  identify: IIdentifyBy<T>,
): T[] {
  return Object.values(hashMapBy<T>(values, identify) as Record<any, any>);
}

export function orderBy<TObject, TProperty>(
  predicate: (item: TObject) => TProperty,
  direction: 'asc' | 'desc' = 'asc',
) {
  const factor = direction === 'asc' ? 1 : -1;
  return (x: TObject, y: TObject): number => {
    const a = predicate(x);
    const b = predicate(y);
    if (a > b) {
      return 1 * factor;
    } else if (a < b) {
      return -1 * factor;
    } else {
      return 0;
    }
  };
}

export function filterValues<T>(values: (T | undefined | null)[]): T[] {
  const filteredValues: T[] = [];

  for (const value of values) {
    if (value !== null && value !== undefined) {
      filteredValues.push(value);
    }
  }

  return filteredValues;
}
