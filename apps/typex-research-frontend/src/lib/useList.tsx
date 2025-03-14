import { useMemo, useState } from 'react';

export type IUseListApi<
  Type = unknown,
  Identity extends string | number = string | number,
> = Readonly<{
  forceAdd: (item: Type) => unknown;
  delete: (item: Type | Identity) => unknown;
  upsert: (item: Type) => unknown;
  del: IUseListApi<Type, Identity>['delete'];
  add: IUseListApi<Type, Identity>['upsert'];
  set: (items: Type[]) => unknown;
}>;

type IUseListOutput<
  Type = unknown,
  Identity extends string | number = string | number,
> = Readonly<[ReadonlyArray<Type>, IUseListApi<Type, Identity>]>;

export function useList<
  Type = unknown,
  Identity extends string | number = string | number,
>(
  identity: (item: Type) => Identity,
  items: Type[],
): IUseListOutput<Type, Identity> {
  const [_items, _setItems] = useState<Type[]>(items);

  return useMemo<IUseListOutput<Type, Identity>>(() => {
    const upsert = (item: Type) => {
      _setItems((items) => {
        let found = false;

        const results = items.map((i) => {
          const isEqual = identity(i) === identity(item);
          if (isEqual) {
            found = true;
          }
          return isEqual ? item : i;
        });

        if (!found) {
          return [...results, item];
        }

        return results;
      });
    };

    const del = (item: Type | Identity) => {
      if (typeof item === 'string' || typeof item === 'number') {
        _setItems((items) =>
          items.filter((i) => identity(i) !== (item as unknown as Identity)),
        );
      } else {
        _setItems((items) =>
          items.filter(
            (i) => identity(i) !== identity(item as unknown as Type),
          ),
        );
      }
    };

    const set = (items: Type[]) => _setItems(items);

    const forceAdd = (item: Type) => _setItems((items) => [...items, item]);

    return [
      _items,
      {
        forceAdd: forceAdd,
        delete: del,
        del: del,
        add: upsert,
        upsert: upsert,
        set: set,
      } satisfies IUseListApi<Type, Identity>,
    ];
  }, [_items, _setItems]);
}
