// types

export type StreamX<Type> = AsyncIterable<Type>;

export type StreamXOf<Input> = StreamX<Input> &
  Readonly<{
    pipe<Output>(mapper: StreamXMapper<Input, Output>): StreamXOf<Output>;
  }>;

export type StreamXLike<Type> =
  | AsyncIterable<Type>
  | Iterable<Type>
  | Type[]
  | ReadonlyArray<Type>;

export type StreamXMapper<Input, Output> = (
  stream: StreamX<Input>,
) => StreamX<Output>;

export type StreamXPromise<Type> = Type | Promise<Type>;

export type StreamXPiper<In, Out> = StreamXMapper<In, Out> & {
  pipe<Output>(mapper: StreamXMapper<Out, Output>): StreamXPiper<In, Output>;
};

// of
export function of<Input>(inputStream: StreamX<Input>): StreamXOf<Input> {
  return {
    [Symbol.asyncIterator]: () => inputStream[Symbol.asyncIterator](),
    pipe<Output>(mapper: StreamXMapper<Input, Output>): StreamXOf<Output> {
      return of(mapper(inputStream));
    },
  };
}

export function pipe<In, Out>(
  mapper: StreamXMapper<In, Out>,
): StreamXPiper<In, Out> {
  const streamMapper: StreamXMapper<In, Out> = (input: StreamX<In>) =>
    mapper(input);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  streamMapper.pipe = <Output>(mapper: StreamXMapper<Out, Output>) => {
    return pipe<In, Output>((input: StreamX<In>) => {
      const nextStream = streamMapper(input);
      return mapper(nextStream);
    });
  };
  return streamMapper as StreamXPiper<In, Out>;
}
