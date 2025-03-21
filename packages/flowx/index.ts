// specification

import { IPromise, IType, IUseType } from '@slavax/typex';

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
  Loop = 'Loop',
  Map = 'Map',
}

export type UseSpec<Type extends FlowSpec> = IUseType<IFlowSpec, Type>;

type IFlowSpecWhen = IType<{
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
}>;
type IFlowSpecThen = IType<{
  type: FlowSpec.Then;
  handler: IThenChainingHandler;
}>;
type IFlowSpecCatch = IType<{
  type: FlowSpec.Catch;
  handler: IThenChainingHandler;
}>;
type IFlowSpecHandler = IType<{
  type: FlowSpec.Handler;
  handler: IHandlerAsFunction;
}>;
type IFlowSpecAll = IType<{
  type: FlowSpec.All;
  values: StreamLike<UseSpec<FlowSpec.Request | FlowSpec.Value>>;
}>;
type IFlowSpecLoop = IType<{
  type: FlowSpec.Loop;
  handler: IFlowLoopFunction;
}>;

export type IFlowSpecMapFunction = IHandlerAsFunction;
type IFlowSpecMap = IType<{
  type: FlowSpec.Map;
  handler: IFlowSpecMapFunction;
}>;

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
  | IFlowSpecWhen
  | IFlowSpecThen
  | IFlowSpecCatch
  | IFlowSpecHandler
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
  | IFlowSpecAll
  | IFlowSpecLoop
  | IFlowSpecMap;

type StreamLike<Type> =
  | AsyncIterable<Type>
  | Iterable<Type>
  | Type[]
  | ReadonlyArray<Type>;

type IFlowToolkitStreamingValue =
  | UseSpec<FlowSpec.Request | FlowSpec.All | FlowSpec.Value>
  | StreamLike<unknown>;

type IFlowLoopToolkit = Readonly<
  IFlowToolkit & {
    input: unknown;
    iteration: number;
    produce: <Type = unknown>(value: Type) => IPromise<Type>;
  }
>;

export type IFlowLoopFunction<
  LoopContext extends Record<any, any> = Record<any, any>,
> = (
  loopContext: LoopContext | null | undefined,
  tools: IFlowLoopToolkit,
) => IPromise<LoopContext | null | undefined | void>;

export type IFlowToolkit = {
  // events
  emit: <Event extends UseSpec<FlowSpec.Event>, Payload = unknown>(
    event: Event,
    payload: Payload,
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

  waitFor: <
    Value extends
      | IFlowToolkitStreamingValue // realtime, active values
      | (() => IPromise<boolean>), // pooling / in case of a function
  >(
    value: Value,
    poolingInterval?: number | (() => number),
    maxPoolingTimout?: number | (() => number),
  ) => Value extends UseSpec<FlowSpec.All | FlowSpec.Loop> | StreamLike<any>
    ? IPromise<unknown[]>
    : IPromise<unknown>;

  stream: <Value extends IFlowToolkitStreamingValue, Output = unknown>(
    value: Value,
  ) => AsyncIterable<Output>;

  toArray: <
    Value extends IFlowToolkitStreamingValue | unknown,
    Output = unknown,
  >(
    value: Value,
  ) => IPromise<Output[]>;

  // state manipulation
  has: (subject: UseSpec<FlowSpec.State>) => Promise<boolean>;

  get: <
    Subject extends UseSpec<FlowSpec.State | FlowSpec.Entity>,
    Output = unknown,
  >(
    value: Subject,
  ) => Promise<
    Subject extends UseSpec<FlowSpec.Entity> ? AsyncIterable<Output> : Output
  >;

  set: <
    Subject extends UseSpec<FlowSpec.State | FlowSpec.Entity>,
    Payload = unknown,
  >(
    subject: Subject,
    payload: Payload,
  ) => Promise<unknown>;

  del: (value: UseSpec<FlowSpec.State> | string) => Promise<unknown>;
};

type IFlowAwaitable = UseSpec<FlowSpec.Request | FlowSpec.Value | FlowSpec.All>;

type IHandlerAsFunction<Input = unknown> = (
  input: Input,
  toolkit: IFlowToolkit,
) => IPromise<undefined | void | IFlowAwaitable>;

// output of this function is what will be the result of the requested command/query
type IResolutionFunction<Input = unknown, Output = unknown> = (
  input: Input,
  toolkit: IFlowToolkit,
) => IPromise<Output>;

type IThenChainingHandler =
  | IHandlerAsFunction
  | UseSpec<
      | FlowSpec.Handler
      | FlowSpec.Resolve
      | FlowSpec.Reject
      | FlowSpec.Loop
      | FlowSpec.Map
    >;

const _dataType = Symbol('_dataType');
export type IFlowSpecState<Type = any> = IType<
  {
    type: FlowSpec.State;
    name: string;
    title: string;
    identity?: (value: Type) => IPromise<string>;
  } & {
    [_dataType]?: IFlowSpecDataType<Type>;
  }
>;

export type IFlowSpecEntity<EntityType = any> = IType<
  {
    type: FlowSpec.Entity;
    name: string;
    title: string;
    identity?: (value: EntityType) => IPromise<string>;
  } & {
    [_dataType]?: IFlowSpecDataType<EntityType>;
  }
>;

export type IFlowSpecDataType<Type = unknown> = IType<{
  type: FlowSpec.DataType;
  dataType: Type;
}>;

export type IFlowSpecValue<Value = unknown> = IType<{
  type: FlowSpec.Value;
  value: Value | Promise<Value>;
}>;
