import {
  EmitServiceEvent,
  IGetServiceEvents,
  Service,
  ServiceCall,
} from '@slavax/typex';
import { App, IApp } from '@typex-reserach/app';

export function AppService() {
  const emit = EmitServiceEvent<IGetServiceEvents<IApp>>();
  const call = ServiceCall<IApp>();

  return Service<IApp>({
    [App.Hello]: async (input) => {
      return await emit(input, App.SaidHello, {
        type: App.SaidHello,
      });
    },
  });
}
