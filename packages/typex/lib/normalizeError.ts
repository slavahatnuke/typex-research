import { IError } from '../index';

export function normalizeError<Type extends Error | IError<any>>(error: Type): Type {
  return {
    ...error,
    name: error.name,
    message: error.message,
    stack: error.stack,

    // @ts-ignore
    type: error.type ?? undefined,

    // @ts-ignore
    data: error.data ?? undefined,

    // @ts-ignore
    origin: error.origin,
  };
}
