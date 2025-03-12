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
