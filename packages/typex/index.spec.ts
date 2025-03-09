import {
  EmitServiceEvent,
  ICommand,
  IEvent,
  IGetServiceEvents,
  IModel,
  IQuery,
  IServiceFunctions,
  IServiceOutputEvents,
  Service,
  ServiceCall,
  ServiceFunctions,
} from './index';
import { describe, expect, it } from 'vitest';
import { Collect } from '@repo/testing/collect';

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
  it('Service', async () => {
    // helpers to emit events and call other functions in service
    const emit = EmitServiceEvent<IUserEvents>();
    const call = ServiceCall<IUserActions>();

    // functions of the service
    function UserFunctions(): IServiceFunctions<IUserActions> {
      return ServiceFunctions<IUserActions>({
        CreateUser: async (input, context) => {
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
        GetUser: async (input, context) => {

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
    const collectEvents = Collect();
    const events: IServiceOutputEvents<IUserActions> = async (
      event,
      context,
      input,
    ) =>
      collectEvents({
        event,
        input,
        context,
      });

    // api
    const api = Service<IUserActions>(
      {
        ...UserFunctions(),
      },
      events,
    );

    // check that no events are emitted
    expect(collectEvents()).toEqual([]);

    // create a user
    const userCreated = await api('CreateUser', {
      email: 'email',
      name: 'name',
    });
    expect(userCreated).toEqual({
      type: 'UserCreated',
      userId: 'userId123',
    });

    // get the user
    const user = await api('GetUser', { userId: userCreated.userId });
    expect(user).toEqual({
      type: 'User',
      email: 'email',
      id: 'userId123',
      name: 'name',
    });

    // check that the events are emitted
    expect(collectEvents()).toEqual([
      {
        context: undefined,
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
