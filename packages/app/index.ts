import { ICommand, IEvent } from '@repo/typex';

export enum App {
  Hello = 'Hello',
  SaidHello = 'SaidHello',
}

type IHello = ICommand<{ type: App.Hello }, ISaidHello, ISaidHello>;

export type ISaidHello = IEvent<{ type: App.SaidHello }>;
export type IApp = IHello;
