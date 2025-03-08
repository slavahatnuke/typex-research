// LOCAL
// types testing
import { ICommand, IEvent, IModel, IQuery, IService, Service } from './index';

type IEventUserCreated = IEvent<{ type: 'UserCreated'; userId: string }>;

type ICreateUser = ICommand<
  { type: 'CreateUser'; email: string; name: string },
  IEventUserCreated,
  IEventUserCreated
>;

type IUserReadModel = IModel<{
  type: 'User';
  id: string;
  email: string;
  name: string;
}>;

type IGetUser = IQuery<{ type: 'GetUser'; userId: string }, IUserReadModel>;

type IUserActions = ICreateUser | IGetUser;

async function test() {
  const userApi = Service<IUserActions>({});

  const userCreated = await userApi('CreateUser', {
    email: 'email',
    name: 'name',
  });

  console.log(userCreated.userId);

  const user = await userApi('GetUser', { userId: userCreated.userId });

  console.log(user.email);
}

type IUserService = IService<IUserActions>;
