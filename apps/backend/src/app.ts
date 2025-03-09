import { Service } from '@repo/typex';
import { App, IApp, ISaidHello } from '@repo/app';

export function AppService() {
  return Service<IApp>({
    [App.Hello]: async (input, context) => {
      const event: ISaidHello = { type: App.SaidHello };
      return event;
    },
  });
}
