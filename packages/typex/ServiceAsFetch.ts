import { IService, IType, NewError } from './index';

enum ServiceAsFetchError {
  FetchResponseNotOk = 'FetchResponseNotOk',
}

export const FetchResponseNotOk = NewError<{
  type: ServiceAsFetchError.FetchResponseNotOk;
  request: any;
  response: any;
  status: number;
}>(ServiceAsFetchError.FetchResponseNotOk);

export function ServiceAsFetch<
  ApiSpecification extends IType = IType,
  Context extends IType | void = void,
>(url: string): IService<ApiSpecification, Context> {
  return async (type, input, context) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...input, type }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw FetchResponseNotOk({
        status: response.status,
        request: input,
        response: await response.text(),
      });
    }
  };
}
