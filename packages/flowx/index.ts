// specification

import { IMetaObject, IPromise, IType, IUseType } from '@slavax/typex';

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
  Request = 'Request',
  RequestId = 'RequestId',

  State = 'State',
  Entity = 'Entity',
  Value = 'Value',
  DataType = 'DataType',

  All = 'All',
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
  | IFlowSpecState
  | IFlowSpecEntity
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
      handler: IResolutionFunction;
    }>
  | IType<{
      type: FlowSpec.Reject;
      subject: UseSpec<FlowSpec.Command | FlowSpec.Query>;
      handler: IResolutionFunction;
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
    }>
  | IType<{
      type: FlowSpec.Request;
      id: UseSpec<FlowSpec.RequestId>;
      name: string;
      input: unknown;
    }>
  | IType<{
      type: FlowSpec.RequestId;
      id: string;
      parent?: UseSpec<FlowSpec.RequestId>;
    }>
  | IFlowSpecValue
  | IType<{
      type: FlowSpec.All;
      values: StreamLike<
        UseSpec<FlowSpec.Request | FlowSpec.Value> | Promise<unknown>
      >;
    }>;

type StreamLike<Type> =
  | AsyncIterable<Type>
  | Iterable<Type>
  | Type[]
  | ReadonlyArray<Type>;

export type IFlowToolkit = {
  // events
  emit: <Event extends UseSpec<FlowSpec.Event>>(
    event: Event,
    payload: unknown,
  ) => IPromise;

  // sub-requests
  call: <Input = unknown, Output = unknown>(
    name: string | UseSpec<FlowSpec.Command | FlowSpec.Query>, // command or query name
    input: Input, // payload
  ) => IPromise<Output>;

  request: <Input = unknown>(
    name: string | UseSpec<FlowSpec.Command | FlowSpec.Query>, // command or query name
    input: Input, // payload
  ) => UseSpec<FlowSpec.Request>;

  // values
  value: <Type = unknown>(value: Type) => IFlowSpecValue<Type>;

  // wait for all values to be resolved;
  all: <Values extends UseSpec<FlowSpec.All>['values']>(
    values: Values,
  ) => UseSpec<FlowSpec.All>;

  // values
  has: (value: UseSpec<FlowSpec.State>) => boolean;
  get: <Value extends UseSpec<FlowSpec.State>>(value: Value) => unknown;
  set: <Value extends UseSpec<FlowSpec.State | FlowSpec.Entity>>(
    value: Value,
    payload: unknown,
  ) => unknown;
  del: (value: UseSpec<FlowSpec.State>) => unknown;
};

type IHandlerAsFunction<Input = unknown> = (
  input: Input,
  toolkit: IFlowToolkit,
) => IPromise<
  undefined | void | UseSpec<FlowSpec.Request | FlowSpec.Value | FlowSpec.All>
>;

// output of this function is what will be the result of the requested command/query
type IResolutionFunction<Input = unknown, Output = unknown> = (
  input: Input,
  toolkit: IFlowToolkit,
) => IPromise<Output>;

type IThenChainingHandler =
  | IHandlerAsFunction
  | UseSpec<FlowSpec.Handler | FlowSpec.Resolve | FlowSpec.Reject>;

export type IFlowSpecState<Type = unknown> = IType<{
  type: FlowSpec.State;
  name: string;
  title: string;
  identity?: (value: Type) => IPromise<string>;
}> &
  IMetaObject<IDataType<Type>>;

export type IFlowSpecEntity<EntityType = unknown> = IType<{
  type: FlowSpec.Entity;
  name: string;
  title: string;
  identity?: (value: EntityType) => IPromise<string>;
}> &
  IMetaObject<IDataType<EntityType>>;

export type IDataType<Type = unknown> = IType<{
  type: FlowSpec.DataType;
  dataType: Type;
}>;

export type IFlowSpecValue<Value = unknown> = IType<{
  type: FlowSpec.Value;
  value: Value;
}> &
  IMetaObject<IDataType<Value>>;
