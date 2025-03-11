import { describe, expect, it } from 'vitest';
import { specify } from './index';

describe(specify, () => {
  it('should return an array of commands, queries, events, and whens', () => {
    const spec = specify(
      ({
        command,
        event,
        when,
        requested,
        resolved,
        rejected,
        resolve,
        reject,
      }) => {
        const createUser = command('CreateUser', 'Creates a user');

        const userCreated = event('UserCreated', 'User created');
        const userNotCreated = event('UserNotCreated', 'User NOT created');

        when(createUser).then(async (payload, { emit }) => {
          // do something with user
          // no return needed
          const userId = Math.random().toString();
          await emit(userCreated, { userId: userId });
        });

        when(requested(createUser)).then((payload) => {
          // the same as above: when(createUser).then(...)
        });

        when(userCreated).then(
          resolve(createUser, (payload) => {
            return { userId: '123' };
          }),
        );

        when(userNotCreated).then(
          reject(createUser, (payload) => {
            return { userId: '123' };
          }),
        );

        when(resolved(createUser)).then((resolved) => {});
        when(rejected(createUser)).then((rejected) => {});
      },
    );

    expect(spec).toEqual(123);
  });
});
