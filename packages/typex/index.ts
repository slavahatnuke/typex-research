// type

import { normalizeError } from './lib/normalizeError';

export type IType<Type extends { type: string } = { type: string }> =
  Readonly<Type>;

export type IUseType<
  Unit extends IType,
  Type extends Unit['type'] | string,
> = Unit extends IType ? Extract<Unit, { type: Type }> : never;

// helpers

type IOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
// type IRequire<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
type IGetRecordValues<R extends Record<any, any>> = R[keyof R];

export type IPromise<Type = unknown> = Promise<Type> | Type;

// meta
const _kind = Symbol('_kind');
const _output = Symbol('_output');
const _events = Symbol('_events');
const _none = Symbol('_none');

export type IMetaFreeObject<Object extends IType | void | unknown | never> =
  Object extends IType
    ? IType<Omit<Object, typeof _kind | typeof _output | typeof _events>>
    : never;

export type INoneAsUndefined<T> = T extends typeof _none ? undefined : T;
export type INoneAsNever<T> = T extends typeof _none ? never : T;

export type IUseKind<
  ApiSpecification extends IType,
  Kind extends TypeX,
> = Extract<ApiSpecification, { [_kind]?: Kind }>;

export type IGetObjectKind<Type extends IType> = Type extends {
  [_kind]?: any;
}
  ? Exclude<Type[typeof _kind], undefined>
  : never;

export type IGetObjectInput<Type extends IType> = IMetaFreeObject<Type>;
export type IGetObjectOutput<Type extends IType> = Type extends {
  [_output]?: any;
}
  ? INoneAsUndefined<Exclude<Type[typeof _output], undefined>>
  : never;
export type IGetObjectEvents<Type extends IType> = Type extends {
  [_events]?: any;
}
  ? INoneAsNever<Exclude<Type[typeof _events], undefined>>
  : never;

export enum TypeX {
  Command = 'Command',
  Query = 'Query',
  Event = 'Event',
  Error = 'Error',
  Model = 'Model',
  Entity = 'Entity',
}

// actions
export type ICommand<
  Input extends IType,
  Output extends unknown | typeof _none = typeof _none,
  Events extends IEvent<any> | typeof _none = typeof _none,
> = IType<
  Input & {
    [_kind]?: TypeX.Command;
    [_output]?: Output;
    [_events]?: Events;
  }
>;

export type IQuery<
  Input extends IType,
  Output extends unknown | typeof _none = typeof _none,
  Events extends IEvent<any> | typeof _none = typeof _none,
> = IType<
  Input & {
    [_kind]?: TypeX.Query;
    [_output]?: Output;
    [_events]?: Events;
  }
>;

export type IEvent<
  Payload extends IType,
  Events extends IEvent<any> | typeof _none = typeof _none,
> = IType<
  Payload & {
    [_kind]?: TypeX.Event;
    [_events]?: Events;
  }
>;

export type IError<Type extends IType> = IType<
  Error & { type: Type['type']; data: Type; origin?: Error }
>;

// model
export type IModel<Type extends IType = IType> = IType<
  Type & {
    [_kind]?: TypeX.Model;
  }
>;

// entity
export type IEntity<
  Type extends IType<
    { type: string } & {
      id: string | number;
      version: string | number;
    }
  > = IType<
    { type: string } & {
      id: string | number;
      version: string | number;
    }
  >,
> = IType<
  Type & {
    [_kind]?: TypeX.Entity;
  }
>;

// errors

export type IGetErrorData<Input extends IType> =
  Input extends IError<IType> ? IGetObjectInput<Input>['data'] : never;

export type INewErrorPayload<Type extends IType> =
  Type extends IError<IType>
    ? IOptional<IGetErrorData<Type>, 'type'>
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

      let messageContext: string = '';

      try {
        messageContext = JSON.stringify(this.data, null, 2);
      } catch (error) {
        // ignore
      }

      this.message = `${this.message}\n${messageContext}`;
    }

    toJSON() {
      return {
        ...this,
        type: this.type,
        message: this.message,
        name: this.name,
        stack: this.stack,
        data: this.data,
        origin: this.origin,
      };
    }

    toString() {
      return 'hello';
    }
  }

  return (payload, origin?: Error) =>
    new _Error(payload, origin) as unknown as IError<Type>;
}

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
  input: IServiceInput<IUseType<ApiSpecification, InputType>>,
  context: Context,
) => Promise<IServiceOutput<IUseType<ApiSpecification, InputType>>>) &
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
  if (!service[_subscribe]) {
    throw ServiceSubscriberNotFound({
      service,
    });
  }
  return service[_subscribe];
}

type IServiceAction = ICommand<any> | IQuery<any> | IEvent<any>;

export type IServiceFunction<Action extends IServiceAction> = (
  input: IGetObjectInput<Action>,
) => IPromise<IServiceOutput<Action>>;

export type IServiceFunctions<ApiSpecification extends IType> = {
  [Type in ApiSpecification['type']]: IServiceFunction<
    IUseType<ApiSpecification, Type>
  >;
};

export type IServiceInput<Input extends IServiceAction> = IOptional<
  IMetaFreeObject<Input>,
  'type'
>;

export type IServiceOutput<Input extends IServiceAction> =
  IGetObjectOutput<Input> extends IType
    ? IMetaFreeObject<IGetObjectOutput<Input>>
    : Input;

const _emitter = Symbol('_emitter');
const _caller = Symbol('_caller');
const _context = Symbol('_context');

export type IGetServiceEventsFromActions<ApiSpecification extends IType> =
  IGetRecordValues<
    Readonly<{
      [Type in ApiSpecification['type']]: IGetObjectEvents<
        IUseType<ApiSpecification, Type>
      >;
    }>
  >;

export type IGetServiceEventsFromSpecification<ApiSpecification extends IType> =
  IUseKind<ApiSpecification, TypeX.Event>;

export type IGetServiceEvents<ApiSpecification extends IType> =
  | IGetServiceEventsFromActions<ApiSpecification>
  | IGetServiceEventsFromSpecification<ApiSpecification>;

export function ServiceFunctions<ApiSpecification extends IType>(
  input: IServiceFunctions<ApiSpecification>,
): IServiceFunctions<ApiSpecification> {
  return input;
}

export function ServiceFunction<
  Input extends ICommand<any> | IQuery<any> | IEvent<any> | IType,
>(
  fn: (input: IMetaFreeObject<Input>) => IPromise<IServiceOutput<Input>>,
): (input: IMetaFreeObject<Input>) => IPromise<IServiceOutput<Input>> {
  return fn;
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

export function _serviceSetSubscribe<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
>(
  service: IServiceHandler<ApiSpecification, Context>,
  subscribe: ISubscribeService<ApiSpecification, Context, IEvent<any>>,
): IService<ApiSpecification, Context, IEvent<any>> {
  (service as any)[_subscribe] = subscribe;
  // @ts-ignore
  return service;
}

type IServiceHandler<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
> = (
  type: ApiSpecification['type'],
  input: IServiceInput<ApiSpecification>,
  context: Context,
) => Promise<IServiceOutput<ApiSpecification>>;

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

  const serviceHanler = defineService({ events });

  return _serviceSetSubscribe<ApiSpecification, Context>(
    serviceHanler,
    events.subscribe,
  );
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

    const serviceHandler: IServiceHandler<ApiSpecification, Context> =
      ServiceHandler<ApiSpecification, Context>(
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

                // @ts-ignore
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

                // @ts-ignore
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

                // @ts-ignore
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

export type IEmitServiceEvent<Events extends IType> = <
  EventType extends Events['type'],
>(
  action: IServiceAction,
  eventType: EventType,
  event: IOptional<IUseType<IMetaFreeObject<Events>, EventType>, 'type'>,
) => Promise<IUseType<IMetaFreeObject<Events>, EventType>>;

export function EmitServiceEvent<
  Events extends IType,
>(): IEmitServiceEvent<Events> {
  return async (action, eventType, event) => {
    // @ts-ignore
    const emitter = action[_emitter];

    if (emitter) {
      // @ts-ignore
      return await emitter(eventType, event);
    } else {
      throw ServiceEventEmitterNotFound({
        action: action,
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
  action: IServiceAction,
  inputType: InputType,
  input: IServiceInput<IUseType<ApiSpecification, InputType>>,
  context?: Context,
) => Promise<IServiceOutput<IUseType<ApiSpecification, InputType>>>;

export function ServiceCall<
  ApiSpecification extends IType,
  Context extends IContext | void = void,
>(): IServiceCall<ApiSpecification, Context> {
  return async (action, inputType, input, _context?: Context) => {
    // @ts-ignore
    const caller = action[_caller];

    if (caller) {
      return await caller(action, inputType, input, _context);
    } else {
      throw ServiceCallerNotFound({
        action: action,
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
  ServiceSubscriberNotFound = 'ServiceSubscriberNotFound',
}

export type IServiceError = IError<{
  type: ServiceError.ServiceFunctionNotFound;
  functionName: string;
}>;

export type IServiceCallerNotFound = IError<{
  type: ServiceError.ServiceCallerNotFound;
  inputType: string;
  action: IType | any;
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
  action: IType | Record<any, any>;
  event: IType | Record<any, any>;
}>;

export const ServiceEventEmitterNotFound =
  NewError<IServiceEventEmitterNotFound>(
    ServiceError.ServiceEventEmitterNotFound,
  );

export type IServiceSubscriberNotFound = IError<{
  type: ServiceError.ServiceSubscriberNotFound;
  service: IService<any, any, any> | any;
}>;

export const ServiceSubscriberNotFound = NewError<IServiceSubscriberNotFound>(
  ServiceError.ServiceSubscriberNotFound,
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

// IsType

export function IsType<
  Union extends IType,
  Types extends Union['type'] = Union['type'],
>(types: ReadonlyArray<Types>) {
  const set = new Set<Types>(types);
  return (type: Union | any): type is IUseType<Union, Types> =>
    !!(
      type &&
      type instanceof Object &&
      'type' in type &&
      set.has(type.type as Types)
    );
}

// HumanizeType
export type IHumanizeTypeOutput<T extends any | IType> = T extends IType
  ? IType<T & { type_: string }>
  : T extends Array<IType> | ReadonlyArray<IType>
    ? IHumanizeTypeOutput<T[number]>[]
    : T;
export type IHumanizeType = <
  T extends any | IType | Array<IType> | ReadonlyArray<IType> | Error | Error[],
>(
  value: T,
) => IHumanizeTypeOutput<T>;

export function HumanizeType(
  enums: Record<string, Record<string, string>>,
): IHumanizeType {
  const map: { [P in string]: string | undefined } = {};
  let mapLoaded = false;

  const loadMap = () => {
    for (const enumName of Object.keys(enums)) {
      for (const key of Object.keys(enums[enumName])) {
        const id = enums[enumName][key];
        map[id] = `${enumName}.${key}`;
      }
    }
  };

  const humanizeType: IHumanizeType = <T extends any | IType>(
    value: T,
  ): IHumanizeTypeOutput<T> => {
    if (!mapLoaded) {
      loadMap();
      mapLoaded = true;
    }

    if (
      value &&
      typeof value === 'object' &&
      'type' in value &&
      'type_' in value
    ) {
      return value as IHumanizeTypeOutput<T>;
    }

    if (value instanceof Error && 'type' in value) {
      const error = new Error(value.message);
      Object.assign(error, value);
      Object.assign(error, humanizeType(normalizeError(error)));
      return error as unknown as IHumanizeTypeOutput<T>;
    }

    if (Array.isArray(value)) {
      return value.map(humanizeType) as unknown as IHumanizeTypeOutput<T>;
    }

    if (typeof value === 'object' && value && !(value instanceof Date)) {
      let result = {} as unknown as IHumanizeTypeOutput<T>;

      if ('type' in value) {
        result = {
          ...value,
          type: value.type,
          type_: map[value.type as string] ?? '',
        } as IHumanizeTypeOutput<T>;
      } else {
        result = { ...value } as IHumanizeTypeOutput<T>;
      }

      for (const key of Object.keys(value)) {
        // @ts-ignore
        result[key] = humanizeType(value[key]);
      }

      return result as unknown as IHumanizeTypeOutput<T>;
    }

    return value as unknown as IHumanizeTypeOutput<T>;
  };

  return humanizeType;
}

// UpgradeType
export type IUpgradeTypeFunction<
  Versions extends IType,
  TargetVersion extends Versions['type'],
> = (type: Versions) => IPromise<IUseType<Versions, TargetVersion>>;

export type IUpgradeTypeConfigurationChain<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;

    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = Readonly<{
  take: IUpgradeTakeFunction<{
    VersionsToTake: Config['AllVersions'];
    TargetVersion: Config['TargetVersion'];
  }>;
  upgrade: IUpgradeConfigurationFunction<{
    AllVersions: Config['AllVersions'];
    TargetVersion: Config['TargetVersion'];
    NextVersionToUpgrade: Config['NextVersionToUpgrade'];
    NextVersionsToOutput: Config['NextVersionsToOutput'];
  }>;
}>;
export type IUpgradeType<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;

    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = Config['NextVersionsToOutput'] extends never
  ? IUpgradeTypeFunction<Config['AllVersions'], Config['NextVersionToUpgrade']>
  : ((input: `UpgradeType:${Config['NextVersionToUpgrade']}`) => never) &
      IUpgradeTypeConfigurationChain<Config>;
type IUpgradeTakeFunction<
  Config extends Readonly<{
    VersionsToTake: IType;
    TargetVersion: IType;
  }>,
> = <Type extends Config['VersionsToTake']['type']>(
  type: Type,
) => IUpgradeType<{
  AllVersions: Config['VersionsToTake'];
  TargetVersion: Config['TargetVersion'];
  NextVersionToUpgrade: Type;
  NextVersionsToOutput: Exclude<Config['VersionsToTake']['type'], Type>;
}>;

type IUpgradeConfigurationFunction<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;
    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = <
  FromType extends Config['NextVersionToUpgrade'],
  ToType extends Config['NextVersionsToOutput'],
  Output extends ToType,
>(
  from: FromType,
  to: ToType,
  upgrade: (
    input: IUseType<Config['AllVersions'], FromType>,
  ) => IPromise<IUseType<Config['AllVersions'], Output>>,
) => IUpgradeType<{
  AllVersions: Config['AllVersions'];
  TargetVersion: Config['TargetVersion'];

  NextVersionToUpgrade: Output;
  NextVersionsToOutput: Exclude<
    Config['NextVersionsToOutput'],
    FromType | ToType | Output
  >;
}>;

type IUpgradeTargetVersion<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
> = TargetVersion extends IType ? TargetVersion['type'] : TargetVersion;

type IUpgradeTypeOutput<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
> = IUpgradeType<{
  AllVersions: Versions;
  TargetVersion: IUseType<
    Versions,
    IUpgradeTargetVersion<Versions, TargetVersion>
  >;
  NextVersionToUpgrade: Versions['type'];
  NextVersionsToOutput: Versions['type'];
}>;
type IUpgradeMigrationRegistry<Versions extends IType> = {
  [Type in Versions['type']]?: (
    input: IUseType<Versions, Type>,
  ) => IPromise<Versions>;
};

export function UpgradeType<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
>(
  targetVersion: IUpgradeTargetVersion<Versions, TargetVersion>,
  { maxIterations = 100_000 }: Partial<{ maxIterations: number }> = {},
): IUpgradeTypeOutput<Versions, TargetVersion> {
  const registry: IUpgradeMigrationRegistry<Versions> =
    {} as IUpgradeMigrationRegistry<Versions>;

  const chain: IUpgradeTypeConfigurationChain<{
    AllVersions: Versions;
    TargetVersion: IUseType<
      Versions,
      IUpgradeTargetVersion<Versions, TargetVersion>
    >;
    NextVersionToUpgrade: Versions['type'];
    NextVersionsToOutput: Versions['type'];
  }> = {
    take: (type) => {
      registry[type] = async (input) => {
        return input as any;
      };
      return mapper as any;
    },
    upgrade: (from, to, upgrade) => {
      registry[from] = upgrade;
      return mapper as any;
    },
  };

  const mapper: IUpgradeTypeFunction<
    Versions,
    IUpgradeTargetVersion<Versions, TargetVersion>
  > = async (input) => {
    let _input = input;
    let iterations = 0;
    while (iterations < maxIterations) {
      iterations += 1;

      if (_input && 'type' in _input) {
        const handler = registry[_input.type as Versions['type']];

        if (handler) {
          const output = await handler(_input as any);
          if (output.type === targetVersion) {
            return output as IUseType<
              Versions,
              IUpgradeTargetVersion<Versions, TargetVersion>
            >;
          }
          if (_input.type === output.type && output.type !== targetVersion) {
            throw new Error(
              `${UpgradeType.name}/InvalidUpgrade:${JSON.stringify({
                input: _input,
                output,
                targetVersion,
                inputType: _input.type,
                outputType: output.type,
              })}`,
            );
          } else {
            _input = output;
          }
        } else {
          if (input.type === targetVersion) {
            return input as IUseType<
              Versions,
              IUpgradeTargetVersion<Versions, TargetVersion>
            >;
          } else {
            throw new Error(
              `${UpgradeType.name}/NoUpgradeFunction:${JSON.stringify(_input.type)}`,
            );
          }
        }
      } else {
        throw new Error(
          `${UpgradeType.name}/InvalidInput:${JSON.stringify(_input)}`,
        );
      }
    }

    throw new Error(
      `${UpgradeType.name}/ExceededNumberOfIterations:${JSON.stringify({ iterations, input })}`,
    );
  };

  return Object.assign(mapper, chain) as unknown as IUpgradeTypeOutput<
    Versions,
    TargetVersion
  >;
}

export type IUpgradedType<
  AllVersions extends IType,
  TargetType extends AllVersions['type'],
> = IUseType<AllVersions, TargetType>;
