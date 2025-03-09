// type

export type IType<Type extends { type: string } = { type: string }> =
  Readonly<Type>;

export type IUseType<
  Unit extends IType | never | void | unknown,
  Type extends string,
> = Unit extends IType ? Extract<Unit, { type: Type }> : never;

// helpers

type IOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type IRequire<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
export type IValueOfRecord<R extends Record<any, any>> = R[keyof R];

// meta
const _meta = Symbol('_meta');
type meta = typeof _meta;

export type IMetaObject<MetaInfo = unknown> = Readonly<{ [_meta]?: MetaInfo }>;
export type IGetMeta<Type extends IType> = Type extends IMetaObject
  ? Type[meta]
  : never;
export type IMetaType<Type extends IType, MetaInfo = unknown> = IType<
  Type & IMetaObject<IGetMeta<Type> | MetaInfo>
>;
export type IMetaFree<Type extends IType | void | unknown | never> =
  Type extends IType ? IType<Omit<Type, meta>> : never;

// actions
enum Action {
  Command = 'Command',
  Query = 'Query',
  Event = 'Event',
  Error = 'Error',
}

enum Payload {
  Request = 'Request',
  Response = 'Response',

  Events = 'Events',
  EventPayload = 'EventPayload',

  Model = 'Model',
  ModelPayload = 'ModelPayload',
  ErrorPayload = 'ErrorPayload',
}

type IRequestPayload<Request extends IType> = IType<{
  type: Payload.Request;
  request: IMetaFree<Request>;
}>;
type IResponsePayload<Response extends IType | void = void> = IType<{
  type: Payload.Response;
  response: Response;
}>;
type IEventsPayload<Events extends IType | void = void> = IType<{
  type: Payload.Events;
  events: IMetaFree<Events>;
}>;
type IActionType<Type extends Action> = IType<{
  type: Type;
}>;

export type ICommand<
  Request extends IType,
  Response extends IType | void = void,
  Events extends IType | void = void,
> = IMetaType<
  Request,
  | IActionType<Action.Command>
  | IRequestPayload<Request>
  | IResponsePayload<Response>
  | IEventsPayload<Events>
>;

export type IQuery<Request extends IType, Response extends IType> = IMetaType<
  Request,
  | IActionType<Action.Query>
  | IRequestPayload<Request>
  | IResponsePayload<Response>
>;

type IEventPayload<Payload extends IType> = IType<{
  type: Payload.EventPayload;
  payload: Payload;
}>;

export type IEvent<
  Payload extends IType,
  Events extends IType | void = void,
> = IMetaType<
  Payload,
  IActionType<Action.Event> | IEventPayload<Payload> | IEventsPayload<Events>
>;

type IErrorPayload<Type extends IType> = {
  type: Payload.ErrorPayload;
  payload: Type;
};
type IErrorAction = {
  type: Action.Error;
};

export type IError<Type extends IType> = IMetaType<
  Error & { toJSON: Type & Error } & Type,
  IErrorAction | IErrorPayload<Type>
>;

// model
export type IModel<Type extends IType = IType> = IMetaType<
  Type,
  | IType<{
      type: Payload.Model;
    }>
  | IType<{ type: Payload.ModelPayload; payload: Type }>
>;
// errors

export type INewError<Type extends IType> = (
  payload: IOptional<IGiveErrorPayload<Type>, 'type'>,
) => IError<Type>;

export function NewError<Type extends IType>(
  type: Type['type'],
): INewError<Type> {
  class _Error extends Error {
    readonly type: Type['type'] = type;

    readonly origin?: Error;

    constructor(
      payload: IOptional<IGiveErrorPayload<Type>, 'type'>,
      origin?: Error,
    ) {
      super(type);
      Object.assign(this, payload);
      this.origin = origin;
    }

    toJSON() {
      return {
        ...this,
        type: this.type,
        name: this.name,
        stack: this.stack,
      };
    }
  }

  return (payload, origin?: Error) =>
    new _Error(payload, origin) as IError<Type>;
}

type IGiveErrorPayload<
  Input extends IType,
  X extends IUseType<IGetMeta<Input>, Payload.ErrorPayload> = IUseType<
    IGetMeta<Input>,
    Payload.ErrorPayload
  >,
> = X extends IErrorPayload<IType> ? X['payload'] : never;

// service

export type IService<
  ApiSpecification extends IType,
  Context extends IType | void = void,
> = <InputType extends ApiSpecification['type']>(
  type: InputType,
  input: IServiceInput<ApiSpecification, InputType>,
  context: Context,
) => Promise<IServiceOutput<ApiSpecification, InputType>>;

export type IGiveRequestPayload<
  Input extends IType,
  X extends IUseType<IGetMeta<Input>, Payload.Request> = IUseType<
    IGetMeta<Input>,
    Payload.Request
  >,
> = X extends IRequestPayload<IType> ? X['request'] : never;

export type IGiveResponsePayload<
  Input extends IType,
  X extends IUseType<IGetMeta<Input>, Payload.Response> = IUseType<
    IGetMeta<Input>,
    Payload.Response
  >,
> = X extends IResponsePayload<IType> ? X['response'] : void;

type IGiveRequestInput<
  ApiSpecification extends IType,
  InputType extends ApiSpecification['type'],
> = IGiveRequestPayload<IUseType<ApiSpecification, InputType>>;

type IGiveRequestOutput<
  ApiSpecification extends IType,
  InputType extends ApiSpecification['type'],
> = IGiveResponsePayload<IUseType<ApiSpecification, InputType>>;

type IServiceInput<
  ApiSpecification extends IType,
  InputType extends ApiSpecification['type'],
> = IOptional<IGiveRequestInput<ApiSpecification, InputType>, 'type'>;

type IServiceOutput<
  ApiSpecification extends IType,
  InputType extends ApiSpecification['type'],
> = IGiveRequestOutput<ApiSpecification, InputType>;

export type IServiceFunctions<
  ApiSpecification extends IType,
  Context extends IType | void = void,
> = {
  [Type in ApiSpecification['type']]: (
    input: IGiveRequestInput<ApiSpecification, Type>,
    context: Context,
  ) => Promise<IServiceOutput<ApiSpecification, Type>>;
};

type IBase = ICommand<any> | IQuery<any, any> | IEvent<any>;

export type IEmitServiceEvent<
  Events extends IType,
  Context extends IType | void = void,
> = <EventType extends Events['type']>(
  base: IBase,
  eventType: EventType,
  event: IOptional<IUseType<IMetaFree<Events>, EventType>, 'type'>,
  context?: Context,
) => Promise<IUseType<IMetaFree<Events>, EventType>>;

export function EmitServiceEvent<
  Events extends IType,
  Context extends IType | void = void,
>(): IEmitServiceEvent<Events, Context> {
  return async (base, eventType, event, context) => {
    // @ts-ignore
    const emitter = base[_emitter];

    if (emitter) {
      // @ts-ignore
      return await emitter(base, eventType, event, context);
    } else {
      throw ServiceEventEmitterNotFound({
        base,
        event,
        context,
      });
    }
  };
}

export type IServiceCall<
  ApiSpecification extends IType,
  Context extends IType | void = void,
> = <InputType extends ApiSpecification['type']>(
  base: IBase,
  inputType: InputType,
  input: IServiceInput<ApiSpecification, InputType>,
  context?: Context,
) => Promise<IServiceOutput<ApiSpecification, InputType>>;

export function ServiceCall<
  ApiSpecification extends IType,
  Context extends IType | void = void,
>(): IServiceCall<ApiSpecification, Context> {
  return async (base, inputType, input, context) => {
    // @ts-ignore
    const caller = base[_caller];

    if (caller) {
      // @ts-ignore
      return await caller(inputType, input, context);
    } else {
      throw ServiceCallerNotFound({
        base,
        inputType,
        input,
        context,
      });
    }
  };
}

const _emitter = Symbol('_emitter');
const _caller = Symbol('_caller');

type IGiveEventsPayloadOfAction<Action extends IType> = IUseType<
  IGetMeta<Action>,
  Payload.Events
>;

type IGetActionEvents<Action extends IType> =
  IGiveEventsPayloadOfAction<Action> extends IEventsPayload<IType>
    ? IGiveEventsPayloadOfAction<Action>['events']
    : never;

export type IGetServiceEvents<ApiSpecification extends IType> = IValueOfRecord<
  Readonly<{
    [Type in ApiSpecification['type']]: IGetActionEvents<
      IUseType<ApiSpecification, Type>
    >;
  }>
>;

export type IServiceEventsOutput<
  ApiSpecification extends IType,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
  Context extends IType | void = void,
> = (
  event: Events,
  context: Context,
  input: ApiSpecification,
) => Promise<unknown>;

export function Service<
  ApiSpecification extends IType,
  Context extends IType | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  functions: IServiceFunctions<ApiSpecification, Context>,
  events?: IServiceEventsOutput<ApiSpecification, Events, Context>,
): IService<ApiSpecification, Context> {
  const _events: IServiceEventsOutput<ApiSpecification, Events, Context> =
    events ?? (async (): Promise<unknown> => undefined);

  return async function service(type, input, context) {
    // @ts-ignore
    const fn = functions[type];
    if (fn) {
      // @ts-ignore
      return await fn(
        //@ts-ignore
        {
          ...input,

          type,

          get [_emitter]() {
            return (async (input, eventType, event, _context) => {
              const _input = {
                ...input,
              };

              // @ts-ignore
              _input[_caller] && delete input[_caller];

              // @ts-ignore
              _input[_emitter] && delete input[_emitter];

              await _events(
                // @ts-ignore
                { ...event, type: eventType },
                _context ?? context,
                input,
              );
              return event;
            }) as IEmitServiceEvent<IType, Context>;
          },

          get [_caller]() {
            return service;
          },
        },
        context,
      );
    } else {
      throw ServiceFunctionNotFound({
        functionName: type,
      });
    }
  };
}

export function emit() {}

export enum ServiceError {
  ServiceFunctionNotFound = 'ServiceFunctionNotFound',
  ServiceCallerNotFound = 'ServiceCallerNotFound',
  ServiceEventEmitterNotFound = 'ServiceEventEmitterNotFound',
}

export type IServiceError = IError<{
  type: ServiceError.ServiceFunctionNotFound;
  functionName: string;
}>;

export type IServiceCallerNotFound = IError<{
  type: ServiceError.ServiceCallerNotFound;
  inputType: string;
  base: IType | any;
  input: IType | any;
  context: IType | any;
}>;

export const ServiceFunctionNotFound = NewError<IServiceError>(
  ServiceError.ServiceFunctionNotFound,
);

export const ServiceCallerNotFound = NewError<IServiceCallerNotFound>(
  ServiceError.ServiceCallerNotFound,
);

export type IServiceEventEmitterNotFound = IError<{
  type: ServiceError.ServiceEventEmitterNotFound;
  base: IType | Record<any, any>;
  event: IType | Record<any, any>;
  context: IType | any;
}>;

export const ServiceEventEmitterNotFound =
  NewError<IServiceEventEmitterNotFound>(
    ServiceError.ServiceEventEmitterNotFound,
  );
