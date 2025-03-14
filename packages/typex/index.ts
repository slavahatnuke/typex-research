// type

export type IType<Type extends { type: string } = { type: string }> =
  Readonly<Type>;

export type IUseType<
  Unit extends IType | never | void | unknown,
  Type extends string,
> = Unit extends IType ? Extract<Unit, { type: Type }> : never;

// helpers

type IOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
// type IRequire<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type IGetRecordValues<R extends Record<any, any>> = R[keyof R];

export type IPromise<Type = unknown> = Promise<Type> | Type;

// meta
const _meta = Symbol('_meta');
type meta = typeof _meta;

export type IMetaObject<MetaInfo = unknown> = Readonly<{ [_meta]?: MetaInfo }>;

export type IGetMetaFromObject<Object extends IType> =
  Object extends IMetaObject ? Exclude<Object[meta], undefined> : never;

export type IMetaType<Type extends IType, MetaInfo = unknown> = IType<
  Type & IMetaObject<IGetMetaFromObject<Type> | MetaInfo>
>;

export type IGetMetaInfo<Object extends IType, Type extends string> = IUseType<
  IGetMetaFromObject<Object>,
  Type
>;

export type IMetaFreeObject<Object extends IType | void | unknown | never> =
  Object extends IType ? IType<Omit<Object, meta>> : never;

// actions
enum Action {
  Command = 'Command',
  Query = 'Query',
  Event = 'Event',
  Error = 'Error',
}

// payloads
enum Payload {
  Request = 'Request',
  Response = 'Response',

  Events = 'Events',
  EventPayload = 'EventPayload',

  Model = 'Model',
  ModelPayload = 'ModelPayload',
  ErrorPayload = 'ErrorPayload',
}

// meta tags
type IRequestPayload<Request extends IType> = IType<{
  type: Payload.Request;
  request: IMetaFreeObject<Request>;
}>;
type IResponsePayload<Response> = IType<{
  type: Payload.Response;
  response: Response;
}>;
type IEventsPayload<Events extends IType | void = void> = IType<{
  type: Payload.Events;
  events: IMetaFreeObject<Events>;
}>;
type IActionType<Type extends Action> = IType<{
  type: Type;
}>;
type IEventPayload<Payload extends IType> = IType<{
  type: Payload.EventPayload;
  payload: Payload;
}>;
type IErrorPayload<Type extends IType> = {
  type: Payload.ErrorPayload;
  payload: Type;
};

// actions
export type ICommand<
  Request extends IType,
  Response extends unknown | void = void,
  Events extends IType | void = void,
> = IMetaType<
  Request,
  | IActionType<Action.Command>
  | IRequestPayload<Request>
  | IResponsePayload<Response>
  | IEventsPayload<Events>
>;

export type IQuery<
  Request extends IType,
  Response extends unknown = unknown,
> = IMetaType<
  Request,
  | IActionType<Action.Query>
  | IRequestPayload<Request>
  | IResponsePayload<Response>
>;

export type IEvent<
  Payload extends IType,
  Events extends IType | void = void,
> = IMetaType<
  Payload,
  IActionType<Action.Event> | IEventPayload<Payload> | IEventsPayload<Events>
>;

type IErrorAction = {
  type: Action.Error;
};

export type IError<Type extends IType> = IMetaType<
  Error & {
    toJSON: IType<{ type: Type['type']; data: Type }> & Error;
  } & IType<{ type: Type['type']; data: Type }>,
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
export type INewErrorPayload<Type extends IType> =
  Type extends IError<IType>
    ? IOptional<IGiveErrorPayload<Type>, 'type'>
    : IOptional<Type, 'type'>;

export type INewError<Type extends IType> = (
  payload: INewErrorPayload<Type>,
) => IError<Type>;

export function NewError<Type extends IType>(
  type: Type['type'],
): INewError<Type> {
  class _Error extends Error {
    readonly type: Type['type'] = type;

    readonly origin?: Error;
    readonly data: Type;

    constructor(payload: INewErrorPayload<Type>, origin?: Error) {
      super(type);
      // @ts-ignore
      this.data = { ...payload, type };
      this.origin = origin;
    }

    toJSON() {
      return {
        ...this,
        type: this.type,
        name: this.name,
        stack: this.stack,
        data: this.data,
      };
    }
  }

  return (payload, origin?: Error) =>
    new _Error(payload, origin) as unknown as IError<Type>;
}

type IGiveErrorPayload<
  Input extends IType,
  X extends IGetMetaInfo<Input, Payload.ErrorPayload> = IGetMetaInfo<
    Input,
    Payload.ErrorPayload
  >,
> = X extends IErrorPayload<IType> ? X['payload'] : never;

// service

const _subscribe = Symbol('_subscribe');

export type IContext<T extends Record<any, any> = Record<any, any>> =
  Readonly<T>;

export type IService<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
> = (<InputType extends ApiSpecification['type']>(
  type: InputType,
  input: IServiceInput<ApiSpecification, InputType>,
  context: Context,
) => Promise<IServiceOutput<ApiSpecification, InputType>>) &
  Readonly<{
    [_subscribe]: ISubscribeService<ApiSpecification, Context, Events>;
  }>;

export type ISubscribeService<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
> = IBus<IServiceEvent<ApiSpecification, Context, Events>>['subscribe'];

export function SubscribeService<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  service: IService<ApiSpecification, Context, Events>,
): ISubscribeService<ApiSpecification, Context, Events> {
  return service[_subscribe];
}

export type IServiceFunctions<ApiSpecification extends IType> = {
  [Type in ApiSpecification['type']]: (
    input: IGiveRequestInput<ApiSpecification, Type>,
  ) => IPromise<IServiceOutput<ApiSpecification, Type>>;
};

export type IGiveRequestPayload<
  Input extends IType,
  X extends IUseType<IGetMetaFromObject<Input>, Payload.Request> = IUseType<
    IGetMetaFromObject<Input>,
    Payload.Request
  >,
> = X extends IRequestPayload<IType> ? X['request'] : never;

export type IGiveResponsePayload<
  Input extends IType,
  X extends IGetMetaInfo<Input, Payload.Response> = IGetMetaInfo<
    Input,
    Payload.Response
  >,
> = X extends IResponsePayload<any> ? X['response'] : void;

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

const _emitter = Symbol('_emitter');
const _caller = Symbol('_caller');
const _context = Symbol('_context');

type IGetEventsFromAction<Action extends IType> =
  IGetMetaInfo<Action, Payload.Events> extends IEventsPayload<IType>
    ? IGetMetaInfo<Action, Payload.Events>['events']
    : never;

type IGetServiceEventsFromActions<ApiSpecification extends IType> =
  IGetRecordValues<
    Readonly<{
      [Type in ApiSpecification['type']]: IGetEventsFromAction<
        IUseType<ApiSpecification, Type>
      >;
    }>
  >;

export type IGetServiceEvents<ApiSpecification extends IType> =
  IGetServiceEventsFromActions<ApiSpecification>;

// | IGetEventsFromSpecification<ApiSpecification>;

export function ServiceFunctions<ApiSpecification extends IType>(
  input: IServiceFunctions<ApiSpecification>,
): IServiceFunctions<ApiSpecification> {
  return input;
}

export type IServiceEvent<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
> = {
  event: Events;
  context: Context;
  input?: ApiSpecification;
};

export function _serviceSetSubscribe(
  service: IServiceHandler<any, any>,
  subscribe: ISubscribeService<any, any, any>,
) {
  (service as any)[_subscribe] = subscribe;
  return service;
}

type IServiceHandler<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
> = (
  type: ApiSpecification['type'],
  input: IServiceInput<ApiSpecification, ApiSpecification['type']>,
  context: Context,
) => Promise<IServiceOutput<ApiSpecification, ApiSpecification['type']>>;

export function NewService<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  defineService: ({
    events,
  }: Readonly<{
    events: IBus<IServiceEvent<ApiSpecification, Context, Events>>;
  }>) => IServiceHandler<ApiSpecification, Context>,
): IService<ApiSpecification, Context, Events> {
  const events =
    InMemoryBus<IServiceEvent<ApiSpecification, Context, Events>>();

  const service = defineService({ events });

  return _serviceSetSubscribe(service, events.subscribe) as IService<
    ApiSpecification,
    Context,
    Events
  >;
}

export function ServiceHandler<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
>(
  handler: IServiceHandler<ApiSpecification, Context>,
): IServiceHandler<ApiSpecification, Context> {
  return handler;
}

export function _cleanServiceInput<Type extends Record<any, any>>(
  input: Type,
): Omit<Type, typeof _caller | typeof _emitter> {
  const _input = { ...input };

  // @ts-ignore
  _input[_caller] && delete _input[_caller];

  // @ts-ignore
  _input[_emitter] && delete _input[_emitter];

  // @ts-ignore
  _input[_context] && delete _input[_context];

  return _input;
}

export function Service<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
  Events extends IEvent<any> = IGetServiceEvents<ApiSpecification>,
>(
  functions: IServiceFunctions<ApiSpecification>,
): IService<ApiSpecification, Context, Events> {
  return NewService<ApiSpecification, Context, Events>(({ events }) => {
    const { publish } = events;

    const serviceHandler = ServiceHandler<ApiSpecification, Context>(
      async (type, input, context) => {
        // @ts-ignore
        const fn = functions[type];
        if (fn) {
          // @ts-ignore
          // @ts-ignore
          return await fn(
            //@ts-ignore
            {
              ...input,

              type,

              [_emitter]: async (eventType: string, event: IEvent<any>) => {
                const _event = { ...event, type: eventType };

                await publish({
                  // @ts-ignore
                  event: _event,
                  context: context,
                  // @ts-ignore
                  input: _cleanServiceInput({ ...input, type }),
                });

                return _event;
              },

              [_caller]: async (
                base: IType,
                inputType: string,
                input: IType,
                nextContext?: Context,
              ) => {
                // @ts-ignore
                if (!base[_context]) {
                  throw ServiceCallerContextNotFound({
                    base,
                    inputType,
                    input,
                    inputContext: _context,
                    context,
                  });
                }

                return await serviceHandler(
                  inputType,
                  // @ts-ignore
                  _cleanServiceInput({
                    ...input,
                    type: inputType,
                  }),
                  // @ts-ignore
                  nextContext ?? base[_context],
                );
              },

              [_context]: context,
            },
          );
        } else {
          throw ServiceFunctionNotFound({
            functionName: type,
          });
        }
      },
    );

    return serviceHandler;
  });
}

// service tools
type IBase = ICommand<any> | IQuery<any, any> | IEvent<any>;

export type IEmitServiceEvent<Events extends IType> = <
  EventType extends Events['type'],
>(
  base: IBase,
  eventType: EventType,
  event: IOptional<IUseType<IMetaFreeObject<Events>, EventType>, 'type'>,
) => Promise<IUseType<IMetaFreeObject<Events>, EventType>>;

export function EmitServiceEvent<
  Events extends IType,
>(): IEmitServiceEvent<Events> {
  return async (base, eventType, event) => {
    // @ts-ignore
    const emitter = base[_emitter];

    if (emitter) {
      // @ts-ignore
      return await emitter(eventType, event);
    } else {
      throw ServiceEventEmitterNotFound({
        base,
        event,
      });
    }
  };
}

export function GetServiceContext<Context extends IContext | void = void>(): <
  Type extends IType,
>(
  base: Type,
) => Context {
  return (base) => {
    // @ts-ignore
    return base[_context] ?? undefined;
  };
}

export type IServiceCall<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
> = <InputType extends ApiSpecification['type']>(
  base: IBase,
  inputType: InputType,
  input: IServiceInput<ApiSpecification, InputType>,
  context?: Context,
) => Promise<IServiceOutput<ApiSpecification, InputType>>;

export function ServiceCall<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
>(): IServiceCall<ApiSpecification, Context> {
  return async (base, inputType, input, _context?: Context) => {
    // @ts-ignore
    const caller = base[_caller];

    if (caller) {
      return await caller(base, inputType, input, _context);
    } else {
      throw ServiceCallerNotFound({
        base,
        inputType,
        input,
        context: _context,
      });
    }
  };
}

// service errors
export enum ServiceError {
  ServiceFunctionNotFound = 'ServiceFunctionNotFound',
  ServiceCallerNotFound = 'ServiceCallerNotFound',
  ServiceEventEmitterNotFound = 'ServiceEventEmitterNotFound',
  ServiceCallerContextNotFound = 'ServiceCallerContextNotFound',
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
  context: IContext | any;
}>;

export type IServiceCallerContextNotFound = IError<{
  type: ServiceError.ServiceCallerContextNotFound;
  base: IType | any;
  inputType: string;
  input: IType | any;
  inputContext: IContext | any;
  context: IContext | any;
}>;

export const ServiceFunctionNotFound = NewError<IServiceError>(
  ServiceError.ServiceFunctionNotFound,
);

export const ServiceCallerNotFound = NewError<IServiceCallerNotFound>(
  ServiceError.ServiceCallerNotFound,
);
export const ServiceCallerContextNotFound =
  NewError<IServiceCallerContextNotFound>(
    ServiceError.ServiceCallerContextNotFound,
  );

export type IServiceEventEmitterNotFound = IError<{
  type: ServiceError.ServiceEventEmitterNotFound;
  base: IType | Record<any, any>;
  event: IType | Record<any, any>;
}>;

export const ServiceEventEmitterNotFound =
  NewError<IServiceEventEmitterNotFound>(
    ServiceError.ServiceEventEmitterNotFound,
  );

// bus

export type IBus<Type extends Record<any, any>> = Readonly<{
  publish: (message: Type) => Promise<unknown>;
  subscribe: (subscriber: IBusSubscriber<Type>) => IBusUnsubscribe;
}>;

export function InMemoryBus<Type extends Record<any, any>>(): IBus<Type> {
  const subscribers: IBusSubscriber<Type>[] = [];

  const publish = async (message: Type) => {
    const promises: IPromise<any>[] = [];

    for (const subscriber of subscribers) {
      promises.push(subscriber(message));
    }

    await Promise.all(promises);
  };

  const subscribe = (subscriber: IBusSubscriber<Type>) => {
    subscribers.push(subscriber);

    return () => {
      const index = subscribers.indexOf(subscriber);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  };

  return {
    publish,
    subscribe,
  };
}

export type IBusSubscriber<Type extends Record<any, any>> = (
  message: Type,
) => IPromise<unknown>;

export type IBusUnsubscribe = () => unknown;
