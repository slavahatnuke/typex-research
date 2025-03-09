// LOCAL
// types testing
import { EmitServiceEvent, ICommand, IEvent, IGetServiceEvents, IModel, IQuery, Service, ServiceCall } from './index';
import { describe, expect, it } from 'vitest';
import { Collect } from '../testing/collect';

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

const x: IUserEvents = {
  type: 'UserCreated',
  userId: 'user123',
};

describe(Service.name, () => {
  it('Service', async () => {
    const emit = EmitServiceEvent<IUserEvents>();
    const call = ServiceCall<IUserActions>();

    const events = Collect();
    const userApi = Service<IUserActions>(
      {
        CreateUser: async (input, context) => {
          const user = await call(input, 'GetUser', {
            userId: 'userId123',
          });

          const event: IUserCreated = {
            type: 'UserCreated',
            userId: user.id,
          };

          return await emit(input, event.type, event);
        },
        GetUser: async (input, context) => {
          return {
            type: 'User',
            id: input.userId,
            email: 'email',
            name: 'name',
          };
        },
      },
      async (event, context, input) => events({ event, input, context }),
    );

    expect(events()).toEqual([]);

    const userCreated = await userApi('CreateUser', {
      email: 'email',
      name: 'name',
    });

    expect(userCreated).toEqual({
      type: 'UserCreated',
      userId: 'userId123',
    });

    const user = await userApi('GetUser', { userId: userCreated.userId });

    expect(user).toEqual({
      type: 'User',
      email: 'email',
      id: 'userId123',
      name: 'name',
    });

    expect(events()).toEqual([
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
