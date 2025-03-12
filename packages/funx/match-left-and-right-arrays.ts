import { sortObject } from './sort-object';

export type IMatchLeftAndRightArraysResult<Left, Right> = {
  matched: { left: Left; right: Right }[];
  unmatched: { left: Left[]; right: Right[] };
};

export function matchLeftAndRightArrays<Left, Right, ID>(
  left: Left[] | ReadonlyArray<Left>,
  right: Right[] | ReadonlyArray<Right>,
  leftToId: (left: Left) => ID,
  rightToId: (left: Right) => ID,
): IMatchLeftAndRightArraysResult<Left, Right> {
  const matched: { left: Left; right: Right }[] = [];

  const leftSet = new Set<Left>();
  const rightSet = new Set<Right>();

  if (!left.length) {
    right.forEach((rightItem) => {
      rightSet.add(rightItem);
    });
  }

  if (!right.length) {
    left.forEach((leftItem) => {
      leftSet.add(leftItem);
    });
  }

  const serializeId = (id: ID): string => {
    if (id instanceof Object) {
      return JSON.stringify(sortObject(id));
    } else {
      return String(id);
    }
  };

  const leftMap = new Map<string, Left>();
  const rightMap = new Map<string, Right>();

  left.forEach((leftItem) => {
    const id = serializeId(leftToId(leftItem));
    leftMap.set(id, leftItem);
  });

  right.forEach((rightItem) => {
    const id = serializeId(rightToId(rightItem));
    rightMap.set(id, rightItem);
  });

  // @ts-ignore
  const ids = new Set<string>([...leftMap.keys(), ...rightMap.keys()]);

  ids.forEach((id) => {
    if (leftMap.has(id) && rightMap.has(id)) {
      matched.push({ left: leftMap.get(id)!, right: rightMap.get(id)! });
    } else {
      if (leftMap.has(id)) {
        leftSet.add(leftMap.get(id)!);
      }

      if (rightMap.has(id)) {
        rightSet.add(rightMap.get(id)!);
      }
    }
  });

  return {
    matched,
    unmatched: {
      // @ts-ignore
      left: [...leftSet],
      // @ts-ignore
      right: [...rightSet],
    },
  };
}
