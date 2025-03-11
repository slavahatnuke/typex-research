// specification

import { IType, IUseType } from '@repo/typex';
import { fastId } from './fun/fastId';

export enum FlowSpec {
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

type Use<Type extends FlowSpec> = IUseType<IFlowSpec, Type>;

export type IFlowSpec =
  | IType<{
      type: FlowSpec.Command;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.CommandId;
      name: string;
    }>
  | IType<{
      type: FlowSpec.Event;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.EventId;
      name: string;
    }>
  | IType<{
      type: FlowSpec.Query;
      name: string;
      title: string;
    }>
  | IType<{
      type: FlowSpec.QueryId;
      name: string;
    }>
  | IType<{
      type: FlowSpec.When;
      subject: Use<
        // meaning requested
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.EventId

        // the same as above - requested
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
      when: Use<FlowSpec.When>;
      then:
        | ((input: unknown, toolkit: IFlowIXToolkit) => IPromise)
        | Use<FlowSpec.Handler | FlowSpec.Resolve | FlowSpec.Reject>;
    }>
  | IType<{
      type: FlowSpec.Handler;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowSpec.Resolve;
      subject: Use<
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.Command
        | FlowSpec.Query
      >;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowSpec.Reject;
      subject: Use<
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.Command
        | FlowSpec.Query
      >;
      handler: (input: unknown, toolkit: IFlowIXToolkit) => IPromise;
    }>
  | IType<{
      type: FlowSpec.Happened;
      subject: Use<FlowSpec.EventId | FlowSpec.Event>;
    }>
  | IType<{
      type: FlowSpec.Requested;
      subject: Use<
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.Command
        | FlowSpec.Query
      >;
    }>
  | IType<{
      type: FlowSpec.Resolved;
      subject: Use<
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.Command
        | FlowSpec.Query
      >;
    }>
  | IType<{
      type: FlowSpec.Rejected;
      subject: Use<
        | FlowSpec.CommandId
        | FlowSpec.QueryId
        | FlowSpec.Command
        | FlowSpec.Query
      >;
    }>;

type IPromise<Type = unknown> = Promise<Type> | Type;

type IFlowIXToolkit = {
  emit: (
    event: Use<FlowSpec.Event | FlowSpec.EventId>,
    payload: unknown,
  ) => IPromise;
};

type ISpecifyLanguage = {
  command: (
    name: string,
    title?: string,
  ) => Use<FlowSpec.Command> & IFlowDefinitionMeta; // command

  event: (
    name: string,
    title?: string,
  ) => Use<FlowSpec.Event> & IFlowDefinitionMeta; // event

  query: (
    name: string,
    title?: string,
  ) => Use<FlowSpec.Query> & IFlowDefinitionMeta; // query

  when: <Subject extends Use<FlowSpec.When>['subject']>(
    subject: Subject,
  ) => Readonly<{
    then: (
      input: Use<FlowSpec.Then>['then'],
    ) => Use<FlowSpec.Then> & IFlowDefinitionMeta;
  }>; // when

  resolve: <Subject extends Use<FlowSpec.Resolve>['subject']>(
    subject: Subject,
    handler: Use<FlowSpec.Resolve>['handler'],
  ) => Use<FlowSpec.Resolve>; // resolve

  reject: <Subject extends Use<FlowSpec.Reject>['subject']>(
    subject: Subject,
    handler: Use<FlowSpec.Reject>['handler'],
  ) => Use<FlowSpec.Reject>; // reject

  happened: <
    Subject extends Use<FlowSpec.Happened>['subject'] | Use<FlowSpec.Event>,
  >(
    subject: Subject,
  ) => Use<FlowSpec.Happened>; // happened

  requested: <Subject extends Use<FlowSpec.Requested>['subject']>(
    subject: Subject,
  ) => Use<FlowSpec.Requested>; // requested

  resolved: <Subject extends Use<FlowSpec.Resolved>['subject']>(
    subject: Subject,
  ) => Use<FlowSpec.Resolved>; // resolved

  rejected: <Subject extends Use<FlowSpec.Rejected>['subject']>(
    subject: Subject,
  ) => Use<FlowSpec.Rejected>; // rejected
};

type IFlowDefinition = Use<
  | FlowSpec.Command
  | FlowSpec.Query
  | FlowSpec.Event
  | FlowSpec.When
  | FlowSpec.Then
>;

export type IFlowDefinitionMeta = Readonly<{ id: string; meta: unknown }>;
export type IDefineFlowOutput = IFlowDefinition & IFlowDefinitionMeta;

export type IDefineFlow = (
  specifier: (language: ISpecifyLanguage) => unknown,
) => IDefineFlowOutput[];

export function DefineFlow<Meta = undefined>(
  meta: Meta,
  { NewId = fastId }: Partial<{ NewId: () => string }> = {},
): IDefineFlow {
  return function _DefineFlow(
    specifier: (language: ISpecifyLanguage) => unknown,
  ) {
    const outputs: IDefineFlowOutput[] = [];

    const add = <Type extends IFlowDefinition>(
      output: Type,
    ): Type & IFlowDefinitionMeta => {
      const item = {
        ...output,
        id: NewId(),
        meta,
      };
      outputs.push(item);
      return item;
    };

    specifier({
      command: (name, title) =>
        add({
          type: FlowSpec.Command,
          name,
          title: title ?? '',
        }),

      event: (name, title) =>
        add({
          type: FlowSpec.Event,
          name,
          title: title ?? '',
        }),

      query: (name, title) =>
        add({
          type: FlowSpec.Query,
          name,
          title: title ?? '',
        }),

      when: (subject) => {
        const when = add({
          type: FlowSpec.When,
          subject,
        });
        return {
          then: (input) =>
            add({
              type: FlowSpec.Then,
              when: when,
              then: input,
            }),
        };
      },

      resolve: (subject, handler) => ({
        type: FlowSpec.Resolve,
        subject,
        handler,
      }),

      reject: (subject, handler) => ({
        type: FlowSpec.Reject,
        subject,
        handler,
      }),

      happened: (subject) => ({
        type: FlowSpec.Happened,
        subject,
      }),

      requested: (subject) => ({
        type: FlowSpec.Requested,
        subject,
      }),

      resolved: (subject) => ({
        type: FlowSpec.Resolved,
        subject,
      }),

      rejected: (subject) => ({
        type: FlowSpec.Rejected,
        subject,
      }),
    });

    return outputs;
  };
}
