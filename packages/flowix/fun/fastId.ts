export type INewId = () => string;

export const fastId: INewId = () => Math.random().toString(36).slice(2);
export const TestId = (startAt = 0): INewId => {
  let id = startAt;
  return () => String(id++);
};
