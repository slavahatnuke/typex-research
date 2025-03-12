import { StreamX } from './index';
import { IRead, read } from './reader';
import { IWriter, Writer } from './writer';
import { syncTick } from '@slavax/funx/tick';

export function merge<T1, T2, T3, T4>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
  stream3: StreamX<T3>,
  stream4: StreamX<T4>,
): StreamX<T1 | T2 | T3 | T4>;
export function merge<T1, T2, T3>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
  stream3: StreamX<T3>,
): StreamX<T1 | T2 | T3>;
export function merge<T1, T2>(
  stream1: StreamX<T1>,
  stream2: StreamX<T2>,
): StreamX<T1 | T2>;
export function merge<Type>(
  ...streams: StreamX<any>[]
): StreamX<Type> {
  let outputBuffer: IWriter<Type>;
  let readOutput: IRead<Type>;
  let _error: Error | undefined = undefined;

  async function finish() {
    if (outputBuffer) {
      await outputBuffer.finish();
    }
  }

  return {
    [Symbol.asyncIterator](): AsyncIterator<Type> {
      return {
        async next(): Promise<IteratorResult<Type>> {
          if (_error) {
            throw _error;
          }

          if (!outputBuffer) {
            outputBuffer = Writer<Type>();

            syncTick(async () => {
              try {
                await Promise.all(
                  streams.map(async (stream) => {
                    const readStream = read(stream);
                    while (true) {
                      if (_error) {
                        break;
                      }
                      const value = await readStream();

                      if (value === read.DONE) {
                        break;
                      } else {
                        await outputBuffer.write(value);
                      }
                    }
                  }),
                );

                await finish();
              } catch (error) {
                _error = error as Error;
              }
            });
          }

          if (!readOutput) {
            readOutput = read<Type>(outputBuffer.stream);
          }

          const output = await readOutput();

          if (_error) {
            throw _error;
          }

          if (output === read.DONE) {
            return { done: true, value: undefined };
          } else {
            return { done: false, value: output };
          }
        },
      };
    },
  };
}
