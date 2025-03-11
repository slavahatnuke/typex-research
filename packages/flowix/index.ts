// specification

import { IType, IUseType } from '@repo/typex';

export enum FlowIX {
  Command = 'Command',
  CommandId = 'CommandId',

  Event = 'Event',
  EventId = 'EventId',

  Query = 'Query',
  QueryId = 'QueryId',

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

type Use<Type extends FlowIX> = IUseType<IFlowIX, Type>;
//
// const _input = Symbol('_input');
// const _output = Symbol('_output');
//
// type IO<Input = unknown, Output = unknown> = Readonly<{
//   [_input]?: Input;
//   [_output]?: Output;
// }>;
//
// export type IGetIO<T> =
//   T extends IO<infer Input, infer Output>
//     ? {
//         input: Exclude<Input, undefined>;
//         output: Exclude<Output, undefined>;
//       }
//     : never;

export type IFlowIX =
  | IType<{
      type: FlowIX.Command;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.CommandId;
      name: string;
    }>
  | IType<{
      type: FlowIX.Event;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.EventId;
      name: string;
    }>
  | IType<{
      type: FlowIX.Query;
      name: string;
      description: string;
    }>
  | IType<{
      type: FlowIX.QueryId;
      name: string;
    }>
  | IType<{
      type: FlowIX.When;
      subject: Use<
        // meaning requested
        | FlowIX.CommandId
        | FlowIX.QueryId
        | FlowIX.EventId

        // the same as above - requested
        | FlowIX.Command
        | FlowIX.Query
        | FlowIX.Event

        // full form with modifiers
        | FlowIX.Requested
        | FlowIX.Resolved
        | FlowIX.Rejected

        // full form for events
        | FlowIX.Happened
      >;
    }>
  | IType<{
      type: FlowIX.Then;
      when: Use<FlowIX.When>;
      then:
        | ((input: unknown, toolkit: IFlowIXToolkit) => IPromise)
        | Use<FlowIX.Handler | FlowIX.Resolve | FlowIX.Reject>;
    }>
  | IType<{
      type: FlowIX.Handler;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowIX.Resolve;
      subject: Use<
        FlowIX.CommandId | FlowIX.QueryId | FlowIX.Command | FlowIX.Query
      >;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowIX.Reject;
      subject: Use<
        FlowIX.CommandId | FlowIX.QueryId | FlowIX.Command | FlowIX.Query
      >;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowIX.Happened;
      subject: Use<FlowIX.EventId | FlowIX.Event>;
    }>
  | IType<{
      type: FlowIX.Requested;
      subject: Use<
        FlowIX.CommandId | FlowIX.QueryId | FlowIX.Command | FlowIX.Query
      >;
    }>
  | IType<{
      type: FlowIX.Resolved;
      subject: Use<
        FlowIX.CommandId | FlowIX.QueryId | FlowIX.Command | FlowIX.Query
      >;
    }>
  | IType<{
      type: FlowIX.Rejected;
      subject: Use<
        FlowIX.CommandId | FlowIX.QueryId | FlowIX.Command | FlowIX.Query
      >;
    }>;

type IPromise<Type = unknown> = Promise<Type> | Type;

type IFlowIXToolkit = {
  emit: (
    event: Use<FlowIX.Event | FlowIX.EventId>,
    payload: unknown,
  ) => IPromise;
};

type ISpecifyLanguage = {
  command: (name: string, description?: string) => Use<FlowIX.Command>; // command

  event: (name: string, description?: string) => Use<FlowIX.Event>; // event

  query: (name: string, description?: string) => Use<FlowIX.Query>; // query

  when: <Subject extends Use<FlowIX.When>['subject']>(
    subject: Subject,
  ) => Readonly<{
    then: (input: Use<FlowIX.Then>['then']) => Use<FlowIX.Then>;
  }>; // when

  resolve: <Subject extends Use<FlowIX.Resolve>['subject']>(
    subject: Subject,
    handler: Use<FlowIX.Resolve>['handler'],
  ) => Use<FlowIX.Resolve>; // resolve

  reject: <Subject extends Use<FlowIX.Reject>['subject']>(
    subject: Subject,
    handler: Use<FlowIX.Reject>['handler'],
  ) => Use<FlowIX.Reject>; // reject

  happened: <
    Subject extends Use<FlowIX.Happened>['subject'] | Use<FlowIX.Event>,
  >(
    subject: Subject,
  ) => Use<FlowIX.Happened>; // happened

  requested: <Subject extends Use<FlowIX.Requested>['subject']>(
    subject: Subject,
  ) => Use<FlowIX.Requested>; // requested

  resolved: <Subject extends Use<FlowIX.Resolved>['subject']>(
    subject: Subject,
  ) => Use<FlowIX.Resolved>; // resolved

  rejected: <Subject extends Use<FlowIX.Rejected>['subject']>(
    subject: Subject,
  ) => Use<FlowIX.Rejected>; // rejected
};

export type ISpecifyOutput = Use<
  FlowIX.Command | FlowIX.Query | FlowIX.Event | FlowIX.When | FlowIX.Then
>;

export type ISpecify = (
  specifier: (language: ISpecifyLanguage) => unknown,
) => ISpecifyOutput[];

export const specify: ISpecify = (
  specifier: (language: ISpecifyLanguage) => unknown,
): ISpecifyOutput[] => {
  const outputs: ISpecifyOutput[] = [];

  const add = <Type extends ISpecifyOutput>(output: Type): Type => {
    outputs.push(output);
    return output;
  };

  specifier({
    command: (name, description) =>
      add({
        type: FlowIX.Command,
        name,
        description: description ?? '',
      }),

    event: (name, description) =>
      add({
        type: FlowIX.Event,
        name,
        description: description ?? '',
      }),

    query: (name, description) =>
      add({
        type: FlowIX.Query,
        name,
        description: description ?? '',
      }),

    when: (subject) => {
      const when = add({
        type: FlowIX.When,
        subject,
      });
      return {
        then: (input) =>
          add({
            type: FlowIX.Then,
            when: when,
            then: input,
          }),
      };
    },

    resolve: (subject, handler) => ({
      type: FlowIX.Resolve,
      subject,
      handler,
    }),

    reject: (subject, handler) => ({
      type: FlowIX.Reject,
      subject,
      handler,
    }),

    happened: (subject) => ({
      type: FlowIX.Happened,
      subject,
    }),

    requested: (subject) => ({
      type: FlowIX.Requested,
      subject,
    }),

    resolved: (subject) => ({
      type: FlowIX.Resolved,
      subject,
    }),

    rejected: (subject) => ({
      type: FlowIX.Rejected,
      subject,
    }),
  });

  return outputs;
};
