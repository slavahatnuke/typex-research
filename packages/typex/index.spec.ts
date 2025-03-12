import {
  EmitServiceEvent,
  GetServiceContext,
  ICommand,
  IContext,
  IEvent,
  IGetServiceEvents,
  IModel,
  InMemoryBus,
  IQuery,
  IServiceEvent,
  IServiceFunctions,
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

type IUserReadModel = IModel<{
  type: 'User';
  id: string;
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
  it('works', async () => {
    // helpers to emit events and call other functions in service
    const emit = EmitServiceEvent<IUserEvents>();
    const call = ServiceCall<IUserActions>();
    type IServiceContext = IContext<{ authToken: string }>;
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
    const serviceContext: IServiceContext = { authToken: 'authToken' };

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
