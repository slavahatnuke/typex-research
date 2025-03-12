// specification

import { IPromise, IType, IUseType } from '@slavax/typex';
import { IFlowIXToolkit } from './DefineFlow';

export enum FlowSpec {
  Command = 'Command',
  Event = 'Event',
  Query = 'Query',

  When = 'When',
  Then = 'Then',
  Catch = 'Catch',

  Handler = 'Handler',
  Resolve = 'Resolve',
  Reject = 'Reject',

  Requested = 'Requested',
  Resolved = 'Resolved',
  Rejected = 'Rejected',

  Happened = 'Happened',
}

export type UseSpec<Type extends FlowSpec> = IUseType<IFlowSpec, Type>;

export type IFlowSpec =
  | IType<{
      type: FlowSpec.Command;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.Event;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.Query;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.When;
      subject: UseSpec<
        // meaning requested
        | FlowSpec.Command
        | FlowSpec.Query
        | FlowSpec.Event

        // full form with modifiers
        | FlowSpec.Requested
        | FlowSpec.Resolved
        | FlowSpec.Rejected

        // full form for events
        | FlowSpec.Happened
      >;
      steps: UseSpec<FlowSpec.Then | FlowSpec.Catch>[];
    }>
  | IType<{
      type: FlowSpec.Then;
      whenId: string;
      handler: IThenChainingHandler;
    }>
  | IType<{
      type: FlowSpec.Catch;
      whenId: string;
      handler: IThenChainingHandler;
    }>
  | IType<{
      type: FlowSpec.Handler;
      handler: IHandlerAsFunction;
    }>
  | IType<{
      type: FlowSpec.Resolve;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
      handler: IHandlerAsFunction;
    }>
  | IType<{
      type: FlowSpec.Reject;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
      handler: IHandlerAsFunction;
    }>
  | IType<{
      type: FlowSpec.Happened;
      subject: UseSpec<FlowSpec.Event>;
    }>
  | IType<{
      type: FlowSpec.Requested;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
    }>
  | IType<{
      type: FlowSpec.Resolved;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
    }>
  | IType<{
      type: FlowSpec.Rejected;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
    }>;

type IHandlerAsFunction = (input: unknown, toolkit: IFlowIXToolkit) => IPromise;

type IThenChainingHandler =
  | IHandlerAsFunction
  | UseSpec<FlowSpec.Handler | FlowSpec.Resolve | FlowSpec.Reject>;
