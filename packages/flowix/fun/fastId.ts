export type INewId = () => string | number;

export const fastId: INewId = () => Math.random().toString(36).slice(2);
export const fastIncrementalId = (startAt = 0): INewId => {
  let id = startAt;
  return () => id++;
};
