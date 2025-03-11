// specification

import { IPromise, IType, IUseType } from '@repo/typex';
import { IFlowIXToolkit } from './DefineFlow';

export enum FlowSpec {
  Command = 'Command',
  Event = 'Event',
  Query = 'Query',

  When = 'When',
  Then = 'Then',

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
    }>
  | IType<{
      type: FlowSpec.Then;
      when: UseSpec<FlowSpec.When>;
      then:
        | ((input: unknown, toolkit: IFlowIXToolkit) => IPromise)
        | UseSpec<FlowSpec.Handler | FlowSpec.Resolve | FlowSpec.Reject>;
    }>
  | IType<{
      type: FlowSpec.Handler;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowSpec.Resolve;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowSpec.Reject;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
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

