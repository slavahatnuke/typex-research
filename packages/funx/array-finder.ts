import { sortObject } from './sort-object';

export function ArrayFinder<Type, ID>(
  items: Type[] | ReadonlyArray<Type>,
  identity: (item: Type) => ID,
): (query: ID) => Type | undefined {
  const map = new Map<string, Type>();

  const serializeId = (id: ID): string => {
    if (id instanceof Object) {
      return JSON.stringify(sortObject(id));
    } else {
      return String(id);
    }
  };

  let initialized = false;

  const initialize = () => {
    for (const item of items) {
      const id = serializeId(identity(item));
      map.set(id, item);
    }
  };

  return (id: ID) => {
    if (!initialized) {
      initialize();
      initialized = true;
    }

    return map.get(serializeId(id));
  };
}

export function StrictArrayFinder<Type, ID>(
  items: Type[] | ReadonlyArray<Type>,
  identity: (item: Type) => ID,
  error: (item: ID) => Error | string,
): (id: ID) => Type {
  const finder = ArrayFinder(items, identity);
  return (id: ID) => {
    const found = finder(id);

    if (!found) {
      const _error = error(id);
      if (typeof _error === 'string') {
        throw new Error(_error);
      }
      throw _error;
    }

    return found;
  };
}
