import {
  EmitServiceEvent,
  GetServiceContext,
  ICommand,
  IContext,
  IEntity,
  IEvent,
  IGetServiceEvents,
  InMemoryBus,
  IQuery,
  IServiceEvent,
  IServiceFunctions,
  IsType,
  Service,
  ServiceCall,
  ServiceFunctions,
  SubscribeService,
} from './index';
import { describe, expect, it } from 'vitest';
import { Collect } from './lib/collect';

type IUserCreated = IEvent<{ type: 'UserCreated'; userId: string }>;

type ICreateUser = ICommand<
  { type: 'CreateUser'; email: string; name: string },
  IUserCreated,
  IUserCreated
>;

type IUserReadModel = IEntity<{
  type: 'User';
  id: string;
  version: number;
  email: string;
  name: string;
}>;

type IGetUser = IQuery<{ type: 'GetUser'; userId: string }, IUserReadModel>;

type IUserActions = ICreateUser | IGetUser;
type IUserEvents = IGetServiceEvents<IUserActions>;

const GetServiceEventsTypeTest1: IUserEvents = {
  type: 'UserCreated',
  userId: 'user123',
};

describe(Service.name, () => {
  it('context works', async () => {
    // helpers to emit events and call other functions in service
    const emit = EmitServiceEvent<IUserEvents>();
    const call = ServiceCall<IUserActions, IServiceContext>();
    type IServiceContext = IContext<{ authToken: string; traceId: string }>;
    const getContext = GetServiceContext<IServiceContext>();

    // functions of the service
    function UserFunctions(): IServiceFunctions<IUserActions> {
      return ServiceFunctions<IUserActions>({
        CreateUser: async (input) => {
          const context = getContext(input);
          expect(context).toEqual(serviceContext);

          // test to call local function
          const user = await call(
            input,
            'GetUser',
            {
              userId: 'userId123',
            },
            {
              ...context,
              traceId: `${context.traceId}.asNextTraceId`,
            },
          );

          // event definition
          const event: IUserCreated = {
            type: 'UserCreated',
            userId: user.id,
          };

          // emit event and return it
          return await emit(input, event.type, event);
        },
        GetUser: async (input) => {
          const context = getContext(input);
          expect(context).toEqual({
            ...serviceContext,
            traceId: `${serviceContext.traceId}.asNextTraceId`,
          });

          // return a test user
          return {
            type: 'User',
            id: input.userId,
            version: 1,
            email: 'email',
            name: 'name',
          };
        },
      });
    }

    // api
    const service = Service<IUserActions, IServiceContext>({
      ...UserFunctions(),
    });

    const subscribe = SubscribeService(service);

    // create a user
    const serviceContext: IServiceContext = {
      authToken: 'authToken',
      traceId: 'traceId1',
    };

    const userCreated = await service(
      'CreateUser',
      {
        email: 'email',
        name: 'name',
      },
      serviceContext,
    );
    expect(userCreated).toEqual({
      type: 'UserCreated',
      userId: 'userId123',
    });
  });
  it('works', async () => {
    // helpers to emit events and call other functions in service
    const emit = EmitServiceEvent<IUserEvents>();
    const call = ServiceCall<IUserActions, IServiceContext>();
    type IServiceContext = IContext<{ authToken: string; traceId: string }>;
    const getContext = GetServiceContext<IServiceContext>();

    // functions of the service
    function UserFunctions(): IServiceFunctions<IUserActions> {
      return ServiceFunctions<IUserActions>({
        CreateUser: async (input) => {
          const context = getContext(input);
          expect(context).toEqual(serviceContext);

          // test to call local function
          const user = await call(input, 'GetUser', {
            userId: 'userId123',
          });

          // event definition
          const event: IUserCreated = {
            type: 'UserCreated',
            userId: user.id,
          };

          // emit event and return it
          return await emit(input, event.type, event);
        },
        GetUser: async (input) => {
          const context = getContext(input);
          expect(context).toEqual(serviceContext);

          // return a test user
          return {
            type: 'User',
            id: input.userId,
            version: 1,
            email: 'email',
            name: 'name',
          };
        },
      });
    }

    // collect events emitted by the service
    const events = Collect<IServiceEvent<any, any, any>>();

    // api
    const service = Service<IUserActions, IServiceContext>({
      ...UserFunctions(),
    });

    const subscribe = SubscribeService(service);
    const un = subscribe(async (evt) => events(evt));

    // check that no events are emitted
    expect(events()).toEqual([]);

    // create a user
    const serviceContext: IServiceContext = {
      authToken: 'authToken',
      traceId: 'traceId1',
    };

    const userCreated = await service(
      'CreateUser',
      {
        email: 'email',
        name: 'name',
      },
      serviceContext,
    );
    expect(userCreated).toEqual({
      type: 'UserCreated',
      userId: 'userId123',
    });

    // get the user
    const user = await service(
      'GetUser',
      { userId: userCreated.userId },
      serviceContext,
    );

    expect(user).toEqual({
      type: 'User',
      email: 'email',
      id: 'userId123',
      name: 'name',
      version: 1,
    });

    // check that the events are emitted
    expect(events()).toEqual([
      {
        context: serviceContext,
        event: {
          type: 'UserCreated',
          userId: 'userId123',
        },
        input: {
          email: 'email',
          name: 'name',
          type: 'CreateUser',
        },
      },
    ]);
  });
});

describe(InMemoryBus.name, () => {
  it('works', async () => {
    const bus = InMemoryBus<IUserEvents>();

    const events = Collect<IUserEvents>();

    const un = bus.subscribe(async (evt) => events(evt));

    await bus.publish({
      type: 'UserCreated',
      userId: 'userId123',
    });

    expect(events()).toEqual([
      {
        type: 'UserCreated',
        userId: 'userId123',
      },
    ]);

    un();

    await bus.publish({
      type: 'UserCreated',
      userId: 'userId345',
    });

    expect(events()).toEqual([
      {
        type: 'UserCreated',
        userId: 'userId123',
      },
    ]);
  });
});

describe(IsType.name, () => {
  it('works', async () => {
    const isUserCreated = IsType<IUserEvents>(['UserCreated']);

    const event: IUserEvents = { type: 'UserCreated', userId: 'userId123' };

    expect(isUserCreated(event)).toEqual(true);

    if (isUserCreated(event)) {
      expect(event.type).toEqual('UserCreated');
    }

    expect(
      isUserCreated({ type: 'UserCreated_123', userId: 'userId123' }),
    ).toBe(false);

    expect(isUserCreated(null)).toBe(false);

    expect(isUserCreated(undefined)).toBe(false);
    expect(isUserCreated(true)).toBe(false);
  });
});
