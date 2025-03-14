import {
  EmitServiceEvent,
  IGetServiceEvents,
  Service,
  ServiceCall,
} from '@slavax/typex';
import { App, IApp, IAppContext } from '@typex-reserach/app';

export function AppService() {
  const emit = EmitServiceEvent<IGetServiceEvents<IApp>>();
  const call = ServiceCall<IApp, IAppContext>();

  return Service<IApp, IAppContext>({
    [App.Hello]: async (input) => {
      return await emit(input, App.SaidHello, {});
    },
  });
}
