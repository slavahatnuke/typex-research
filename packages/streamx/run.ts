import { StreamX } from './index';

export async function run<Type, Default = undefined>(
  stream: StreamX<Type>,
  defaultValue = undefined as Default,
): Promise<Type | Default> {
  let value: Type | Default = defaultValue;
  for await (const record of stream) {
    value = record;
  }
  return value;
}