import { useState } from 'react';

export type IUseListApi<
  Type = unknown,
  Identity extends string | number = string | number,
> = {
  add: (item: Type) => unknown;
  remove: (item: Type | Identity) => unknown;
  update: (item: Type) => unknown;
  put: (item: Type[]) => unknown;
  empty: () => unknown;
};

export function useList<
  Type = unknown,
  Identity extends string | number = string | number,
>(
  identity: (item: Type) => Identity,
  items: Type[],
): Readonly<[ReadonlyArray<Type>, IUseListApi<Type, Identity>]> {
  const [_items, _setItems] = useState<Type[]>(items);

  const api: IUseListApi<Type, Identity> = {
    add: (item: Type) => _setItems((items) => [...items, item]),
    remove: (item: Type | Identity) => {
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
    },
    update: (item: Type) => {
      _setItems((items) =>
        items.map((i) => (identity(i) === identity(item) ? item : i)),
      );
    },
    put: (items: Type[]) => _setItems(items),
    empty: () => _setItems([]),
  };

  return [_items, api];
}
