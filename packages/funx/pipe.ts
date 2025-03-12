// TODO @@@@slava specs
type IMapper = (x: any) => any;

export function syncPipe<Input = void, Output = any>(...mappers: IMapper[]) {
  return function (input: Input): Output {
    // @ts-ignore
    return mappers.reduce(
      (current, mapper) => mapper(current),
      input,
    ) as Output;
  };
}

export function pipe<Input = void, Output = any>(...mappers: IMapper[]) {
  return async function (input: Input): Promise<Output> {
    return (await mappers.reduce(
      async (current, mapper) => mapper(await current),
      (async () => input)(),
    )) as Output;
  };
}
