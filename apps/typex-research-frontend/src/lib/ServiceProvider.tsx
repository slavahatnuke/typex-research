import {
  IContext,
  IEvent,
  IGetServiceEvents,
  IPromise,
  IService,
  IServiceInput,
  IServiceOutput,
  IType,
  IUseType,
} from '@slavax/typex';
import { NewReactProvider } from './NewReactProvider';
import { useEffect, useState } from 'react';
import { assert } from '@slavax/funx/assert';
import { Defer, DeferData } from '@slavax/funx/defer';

export function ServiceProvider<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  name: string,
  service: IService<ApiSpecification, Context, Events>,
  getContext: Context extends void ? void : () => IPromise<Context>,
) {
  const [RootServiceProvider, userServiceInstance] =
    NewReactProvider<IService<ApiSpecification, Context, Events>>(name);

  // useService
  const useServiceApi = <Type extends ApiSpecification['type']>(type: Type) => {
    const instance = userServiceInstance() as IService<
      IUseType<ApiSpecification, Type>,
      Context,
      Events
    >;
    const [response, setResponse] = useState<IServiceOutput<ApiSpecification, Type> | null>(null);
    return [
      response,
      async (input: IServiceInput<ApiSpecification, Type>, context?: Context) => {
        const defer = Defer<typeof response>();

        try {
          setResponse(null)
          assert(getContext, `${ServiceProvider.name}:getContext is not defined`);
          const output = await service(type, input, context ?? await getContext());
          setResponse(output);
          defer.resolve(output);
        } catch (error) {
          setResponse(null)
          defer.reject(error);
          console.log(error);
        }

        return await defer.promise;
      },
    ] as const;
  };
  // useServiceEvents

  const useServiceEvents = () => {};

  return [
    RootServiceProvider,
    useServiceApi,
    useServiceEvents,
    userServiceInstance,
  ] as const;
}
