import {
  IContext,
  IEvent,
  IGetServiceEvents,
  IPromise,
  IService,
  IServiceEvent,
  IServiceInput,
  IServiceOutput,
  IType,
  SubscribeService,
} from '@slavax/typex';
import { NewReactProvider } from './NewReactProvider';
import { useEffect, useMemo, useState } from 'react';
import { assert } from '@slavax/funx/assert';
import {
  ILoaderStatus,
  LoaderStatusPending,
  LoaderStatusRejected,
  LoaderStatusResolved,
  LoaderStatusResolving,
} from './useLoader';
import { mem } from '@slavax/funx/mem';

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
  const useServiceApi = <Type extends ApiSpecification['type']>(
    type: Type,
    {
      keepResponseOnRequest = true,
    }: Partial<{
      keepResponseOnRequest: boolean;
    }> = {},
  ) => {
    const [responseState, setResponseState] = useState<{
      response: IServiceOutput<ApiSpecification, Type> | null;
      status: ILoaderStatus<IServiceOutput<ApiSpecification, Type>, unknown>;
    }>({
      response: null,
      status: LoaderStatusPending(),
    });

    return [
      async (
        input: IServiceInput<ApiSpecification, Type>,
        context?: Context,
      ) => {
        try {
          setResponseState({
            response: keepResponseOnRequest ? responseState.response : null,
            status: LoaderStatusResolving(),
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
            status: LoaderStatusResolved(output),
          });

          return output;
        } catch (error) {
          setResponseState({
            response: null,
            status: LoaderStatusRejected(error),
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
      responseState.status,
    ] as const;
  };

  // useServiceEvents

  const subscribeService = SubscribeService(service);
  const useServiceEvents = <Type extends Events['type']>(
    events: ReadonlyArray<Type>,
    subscriber: (
      event: IServiceEvent<ApiSpecification, Context, Events>['event'],
      serviceEvent: IServiceEvent<ApiSpecification, Context, Events>,
    ) => IPromise<unknown>,
  ) => {
    const eventsSet = useMemo(() => mem(() => new Set(events)), []);

    useEffect(() => {
      const unsubscribe = subscribeService(async (serviceEvent) => {
        const { event } = serviceEvent;

        if (eventsSet().has(event.type)) {
          await subscriber(event, serviceEvent);
        }
      });

      return () => {
        unsubscribe();
      };
    }, []);
  };

  return [
    ServiceInstanceProvider,
    useServiceApi,
    useServiceEvents,
    useServiceInstance,
  ] as const;
}
