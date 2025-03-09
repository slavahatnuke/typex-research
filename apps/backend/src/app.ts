import {
  EmitServiceEvent,
  IGetServiceEvents,
  Service,
  ServiceCall,
} from '@repo/typex';
import { App, IApp } from '@repo/app';

export function AppService() {
  const emit = EmitServiceEvent<IGetServiceEvents<IApp>>();
  const call = ServiceCall<IApp>();

  return Service<IApp>({
    [App.Hello]: async (input, context) => {
      return await emit(input, App.SaidHello, {  });
    },
  });
}
