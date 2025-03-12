import { StreamX, StreamXMapper, StreamXPiper } from './index';

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