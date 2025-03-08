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

export type IEvent<Payload extends IType> = IMetaType<
  Payload,
  IActionType<Action.Event> | IEventPayload<Payload>
>;

type IErrorPayload<Type extends IType> = {
  type: Payload.ErrorPayload;
  payload: Type;
};
type IErrorAction = {
  type: Action.Error;
};

export type IError<Type extends IType> = IMetaType<
  Error & Type,
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

    constructor(payload: IOptional<IGiveErrorPayload<Type>, 'type'>) {
      super(type);
      Object.assign(this, payload);
    }
  }

  return (payload) => new _Error(payload) as IError<Type>;
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
> = {};

export function Service<
  ApiSpecification extends IType,
  Context extends IType | void = void,
>(
  functions: IServiceFunctions<ApiSpecification, Context>,
): IService<ApiSpecification, Context> {
  return async function service(type, input, context) {
    // @ts-ignore
    const fn = functions[type];
    if (fn) {
      // @ts-ignore
      return await fn(input, context);
    } else {
      throw ServiceFunctionNotFound({
        functionName: type,
      });
    }
  };
}

export enum ServiceError {
  ServiceFunctionNotFound = 'ServiceFunctionNotFound',
}

export type IServiceError = IError<{
  type: ServiceError.ServiceFunctionNotFound;
  functionName: string;
}>;

export const ServiceFunctionNotFound = NewError<IServiceError>(
  ServiceError.ServiceFunctionNotFound,
);
