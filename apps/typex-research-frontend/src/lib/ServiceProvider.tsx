import {
  IContext,
  IEvent,
  IGetServiceEvents,
  IPromise,
  IService,
  IServiceInput,
  IServiceOutput,
  IType,
} from '@slavax/typex';
import { NewReactProvider } from './NewReactProvider';
import { useState } from 'react';
import { assert } from '@slavax/funx/assert';
import {
  ILoaderState,
  LoaderStatePending,
  LoaderStateRejected,
  LoaderStateResolved,
  LoaderStateResolving,
} from './useLoader';

export function ServiceProvider<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  name: string,
  service: IService<ApiSpecification, Context, Events>,
  getContext: Context extends void ? void : () => IPromise<Context>,
  {
    onRequestError = async (errorContext) =>
      console.error(errorContext.error, errorContext),
  }: Partial<{
    onRequestError: (errorContext: {
      error: unknown;
      request: ApiSpecification;
      context: Context | void;
    }) => IPromise<unknown>;
  }> = {},
) {
  const [ServiceInstanceProvider, useServiceInstance] =
    NewReactProvider<IService<ApiSpecification, Context, Events>>(name);

  // useService
  const useServiceApi = <Type extends ApiSpecification['type']>(type: Type) => {
    const [responseState, setResponseState] = useState<{
      response: IServiceOutput<ApiSpecification, Type> | null;
      loader: ILoaderState<IServiceOutput<ApiSpecification, Type>, unknown>;
    }>({
      response: null,
      loader: LoaderStatePending(),
    });

    return [
      async (
        input: IServiceInput<ApiSpecification, Type>,
        context?: Context,
      ) => {
        try {
          setResponseState({
            response: null,
            loader: LoaderStateResolving(),
          });

          assert(
            getContext,
            `${ServiceProvider.name}:getContext is not defined`,
          );

          const output = await service(
            type,
            input,
            context ?? (await getContext()),
          );

          setResponseState({
            response: output,
            loader: LoaderStateResolved(output),
          });

          return output;
        } catch (error) {
          setResponseState({
            response: null,
            loader: LoaderStateRejected(error),
          });

          await onRequestError({
            error,
            // @ts-ignore
            request: { ...input, type },
            // @ts-ignore
            context: context ?? (await getContext()),
          });

          throw error;
        }
      },
      responseState.response,
      responseState.loader,
    ] as const;
  };
  // useServiceEvents

  const useServiceEvents = () => {};

  return [
    ServiceInstanceProvider,
    useServiceApi,
    useServiceEvents,
    useServiceInstance,
  ] as const;
}
