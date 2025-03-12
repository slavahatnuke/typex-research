export type INewId<Type extends string | number = string> = () => Type;

export const fastId: INewId<string> = () => Math.random().toString(36).slice(2);
export const FastIncrementalId = (startAt = 0): INewId<number> => {
  let id = startAt;
  return () => id++;
};
