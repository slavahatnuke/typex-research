import { normalizeError } from './lib/normalizeError';
import { IType } from './index';

export type IHumanizeTypeOutput<T extends any | IType> = T extends IType
  ? IType<T & { type_: string }>
  : T extends Array<IType> | ReadonlyArray<IType>
    ? IHumanizeTypeOutput<T[number]>[]
    : T;

export type IHumanizeType = <
  T extends any | IType | Array<IType> | ReadonlyArray<IType> | Error | Error[],
>(
  value: T,
) => IHumanizeTypeOutput<T>;

export function HumanizeType(
  enums: Record<string, Record<string, string>>,
): IHumanizeType {
  const map: { [P in string]: string | undefined } = {};
  let mapLoaded = false;

  const loadMap = () => {
    for (const enumName of Object.keys(enums)) {
      for (const key of Object.keys(enums[enumName])) {
        const id = enums[enumName][key];
        map[id] = `${enumName}.${key}`;
      }
    }
  };

  const humanizeType: IHumanizeType = <T extends any | IType>(
    value: T,
  ): IHumanizeTypeOutput<T> => {
    if (!mapLoaded) {
      loadMap();
      mapLoaded = true;
    }

    if (
      value &&
      typeof value === 'object' &&
      'type' in value &&
      'type_' in value
    ) {
      return value as IHumanizeTypeOutput<T>;
    }

    if (value instanceof Error && 'type' in value) {
      const error = new Error(value.message);
      Object.assign(error, value);
      Object.assign(error, humanizeType(normalizeError(error)));
      return error as unknown as IHumanizeTypeOutput<T>;
    }

    if (Array.isArray(value)) {
      return value.map(humanizeType) as unknown as IHumanizeTypeOutput<T>;
    }

    if (typeof value === 'object' && value && !(value instanceof Date)) {
      let result = {} as unknown as IHumanizeTypeOutput<T>;

      if ('type' in value) {
        result = {
          ...value,
          type: value.type,
          type_: map[value.type as string] ?? '',
        } as IHumanizeTypeOutput<T>;
      } else {
        result = { ...value } as IHumanizeTypeOutput<T>;
      }

      for (const key of Object.keys(value)) {
        // @ts-ignore
        result[key] = humanizeType(value[key]);
      }

      return result as unknown as IHumanizeTypeOutput<T>;
    }

    return value as unknown as IHumanizeTypeOutput<T>;
  };

  return humanizeType;
}
