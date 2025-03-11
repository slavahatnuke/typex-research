import {
  _serviceSetSubscribe,
  IEvent,
  InMemoryBus,
  IService,
  IServiceEvent,
  IType,
  NewError,
} from './index';
import { ensureSlashAtTheEnd } from './lib/ensureSlashAtTheEnd';
import { deserializeJSON, serializeJSON } from './lib/serializeJSON';

enum ServiceAsFetchError {
  FetchResponseNotOk = 'FetchResponseNotOk',
  OutputTypeNotOk = 'OutputTypeNotOk',
}

export const FetchResponseNotOk = NewError<{
  type: ServiceAsFetchError.FetchResponseNotOk;
  request: any;
  response: any;
  status: number;
}>(ServiceAsFetchError.FetchResponseNotOk);

export const OutputTypeNotOk = NewError<{
  type: ServiceAsFetchError.OutputTypeNotOk;
  request: any;
  output: any;
}>(ServiceAsFetchError.OutputTypeNotOk);

export function ServiceAsFetch<
  ApiSpecification extends IType = IType,
  Context extends IType | void = void,
>(
  url: string,
  {
    SSE = true,
    serialize = serializeJSON,
    deserialize = deserializeJSON,
  }: Partial<{
    SSE: boolean;
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  }> = {},
): IService<ApiSpecification, Context> {
  url = ensureSlashAtTheEnd(url);

  const { publish, subscribe } =
    InMemoryBus<IServiceEvent<ApiSpecification, IEvent<any>, Context>>();

  const service = (async (type, input, context) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serialize({ ...input, type }),
    });

    if (response.ok) {
      const output = await response.json();

      if ('type' in output && typeof output.type === 'string') {
        return output;
      } else {
        throw OutputTypeNotOk({
          request: input,
          output: output,
        });
      }
    } else {
      throw FetchResponseNotOk({
        status: response.status,
        request: input,
        response: await response.text(),
      });
    }
  }) as IService<ApiSpecification, Context>;

  if (SSE) {
    const eventSource = new EventSource(`${url}SSE`);

    eventSource.onmessage = async (message) => {
      try {
        const { event, context, input } = deserialize(message.data);
        await publish({
          event,
          context: undefined as any, // should not give backend context to the client
          input,
        });
      } catch (error) {
        console.error(error, message);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };
  }

  _serviceSetSubscribe(service, subscribe);

  return service;
}
