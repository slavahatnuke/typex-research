import { Defer, IDefer } from './defer';

export type IAsyncRequest<
  Request = any,
  Response = void,
  Cancellation = void,
> = Omit<IDefer<Response>, 'promise'> & {
  request: Request;
  response: Promise<Response>;
  cancelled: boolean;
  cancel: (_: Cancellation) => Promise<void> | void;
};

export function AsyncRequest<
  Request = void,
  Response = void,
  Cancellation = void,
>(
  request: Request,
  onCancel?: (cancellation: Cancellation) => Promise<void> | void,
): IAsyncRequest<Request, Response, Cancellation> {
  const deferred = Defer<Response>();

  const cancel = async (cancellation: Cancellation) => {
    instance.cancelled = true;
    if (onCancel) {
      return await onCancel(cancellation);
    }
  };

  const instance = {
    ...deferred,
    cancelled: false,
    request,
    response: deferred.promise,
    cancel,
  };

  return instance;
}
