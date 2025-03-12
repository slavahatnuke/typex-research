import { sortObject } from './sort-object';

export function ArrayIndex<Type, ID>(
  items: Type[] | ReadonlyArray<Type>,
  identity: (item: Type) => ID,
): (query: ID) => Type[] {
  const groups: Record<string, Type[]> = {};

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
      groups[id] = groups[id] || [];
      groups[id].push(item);
    }
  };

  return (id: ID) => {
    if (!initialized) {
      initialize();
      initialized = true;
    }

    return groups[serializeId(id)] ?? [];
  };
}
