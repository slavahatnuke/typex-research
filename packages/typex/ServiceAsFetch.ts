import {
  _serviceSetSubscribe,
  IEvent,
  InMemoryBus,
  IService,
  IServiceEvent,
  IType,
  NewError,
} from './index';

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
>(url: string): IService<ApiSpecification, Context> {
  const { publish, subscribe } =
    InMemoryBus<IServiceEvent<ApiSpecification, IEvent<any>, Context>>();

  const service = (async (type, input, context) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...input, type }),
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

  _serviceSetSubscribe(service, subscribe);

  return service;
}
