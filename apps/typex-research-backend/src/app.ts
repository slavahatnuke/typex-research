import {
  EmitServiceEvent,
  IGetServiceEvents,
  Service,
  ServiceCall,
} from '@slavax/typex';
import { App, IApp, IAppContext } from '@typex-reserach/app';

type IAppEvents = IGetServiceEvents<IApp>;

export function AppService() {
  const emit = EmitServiceEvent<IAppEvents>();
  const call = ServiceCall<IApp, IAppContext>();

  return Service<IApp, IAppContext, IAppEvents>({
    [App.Hello]: async (input) => {
      return await emit(input, App.SaidHello, {});
    },
  });
}
