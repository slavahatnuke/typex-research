import { ICommand, IEvent, Service } from '@repo/typex';

export enum App {
  Hello = 'Hello',
  SaidHello = 'SaidHello',
}

type IHello = ICommand<{ type: App.Hello }, ISaidHello, ISaidHello>;
type ISaidHello = IEvent<{ type: App.SaidHello }>;

export type IApp = IHello;

export function AppService() {
  return Service<IApp>({
    [App.Hello]: async (input, context) => {
      const event: ISaidHello = { type: App.SaidHello };
      return event;
    },
  });
}

AppService();
