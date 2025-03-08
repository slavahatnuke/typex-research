// LOCAL
// types testing
import { ICommand, IEvent, IModel, IQuery, Service } from './index';
import { describe, expect, it } from 'vitest';

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

describe(Service.name, () => {
  it('Service', async () => {
    const userApi = Service<IUserActions>({
      CreateUser: async (input, context) => {
        const event: IUserCreated = {
          type: 'UserCreated',
          userId: 'userId123',
        };
        return event;
      },
      GetUser: async (input, context) => {
        return {
          type: 'User',
          id: input.userId,
          email: 'email',
          name: 'name',
        };
      },
    });

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
  });
});
