// specification

import { IType, IUseType } from '@repo/typex';

export enum FlowIX {
  Command = 'Command',
  Event = 'Event',
  Query = 'Query',

  When = 'When',

  Then = 'Then',

  RunFunction = 'RunFunction',
  Resolve = 'Resolve',
  Reject = 'Reject',

  Function = 'Function',

  Requested = 'Requested',
  Resolved = 'Resolved',
  Rejected = 'Rejected',

  Happened = 'Happened',
}

type Use<Type extends FlowIX> = IUseType<IFlowIX, Type>;

export type IFlowIX =
  | IType<{
      type: FlowIX.Command;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.Event;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.Query;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.When;
      subject: Use<
        // meaning requested
        | FlowIX.Command
        | FlowIX.Query
        | FlowIX.Event

        // full form
        | FlowIX.Requested
        | FlowIX.Happened
      >;
    }>
  | IType<{
      type: FlowIX.Then;
      when: Use<FlowIX.When>;
      then: Use<FlowIX.RunFunction | FlowIX.Resolve | FlowIX.Reject>;
    }>
  | IType<{
      type: FlowIX.RunFunction;
      functionName: string;
    }>
  | IType<{
      type: FlowIX.Resolve;
      subject: Use<FlowIX.Command | FlowIX.Query>;
      resolution: unknown;
    }>
  | IType<{
      type: FlowIX.Reject;
      subject: Use<FlowIX.Command | FlowIX.Query>;
      rejection: unknown;
    }>
  | IType<{
      type: FlowIX.Function;
      name: string;
      function: Function;
    }>
  | IType<{
      type: FlowIX.Happened;
      subject: Use<FlowIX.Event>;
    }>
  | IType<{
      type: FlowIX.Requested;
      subject: Use<FlowIX.Command | FlowIX.Query>;
    }>
  | IType<{
      type: FlowIX.Resolved;
      subject: Use<FlowIX.Command | FlowIX.Query>;
      function: Function;
    }>
  | IType<{
      type: FlowIX.Rejected;
      subject: Use<FlowIX.Command | FlowIX.Query>;
      function: Function;
    }>;
