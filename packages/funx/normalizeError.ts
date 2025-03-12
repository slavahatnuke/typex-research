export function normalizeError<Type extends Error>(error: Type): Type {
  return {
    ...error,
    name: error.name,
    message: error.message,
    stack: error.stack,

    // @ts-ignore
    type: error.type,

    // @ts-ignore
    data: error.data,

    // @ts-ignore
    origin: error.origin,
  };
}
