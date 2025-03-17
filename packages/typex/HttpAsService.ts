import {
  IContext,
  IEvent,
  IGetServiceEvents, IPromise,
  IService,
  IType,
  NewError,
  NewService,
  ServiceHandler,
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

export function HttpAsService<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  url: string,
  getContext: Context extends void ? void : () => Context,
  {
    headers = () => ({}),
    SSE = true,
    serialize = serializeJSON,
    deserialize = deserializeJSON,
  }: Partial<{
    headers: () => Record<string, string> | Headers;
    SSE: boolean;
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  }> = {},
): IService<ApiSpecification, Context, Events> {
  url = ensureSlashAtTheEnd(url);

  return NewService<ApiSpecification, Context, Events>(({ events }) => {
    if (SSE) {
      const { publish } = events;

      const eventSource = new EventSource(`${url}SSE?x-typex-context=${serialize(getContext ? getContext(): {})}`);

      eventSource.onmessage = async (message) => {
        try {
          const { event, context } = deserialize(message.data);
          await publish({
            event,
            context,
            input: undefined,
          });
        } catch (error) {
          console.error(error, message);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
      };
    }

    return ServiceHandler<ApiSpecification, Context>(
      async (type, input, context) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Typex-Context': serialize(context),
            ...headers(),
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
      },
    );
  });
}
