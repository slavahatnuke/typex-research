import { ICommand, IEvent } from '@slavax/typex';

export enum App {
  Hello = 'Hello',
  SaidHello = 'SaidHello',
}

type IHello = ICommand<{ type: App.Hello }, ISaidHello, ISaidHello>;

export type ISaidHello = IEvent<{ type: App.SaidHello }>;
export type IApp = IHello;

export type IAppContext = {
  type: 'AppContext';
  userToken: string;
  traceId: string;
};
