import { describe, expect, it } from 'vitest';
import { SpecifyFlow } from './SpecifyFlow';
import { StreamX } from '@slavax/streamx';


describe(SpecifyFlow.name, () => {
  it('should return an array of commands, queries, events, and whens', () => {
    const specify = SpecifyFlow(undefined);

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
        query,
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

        const getUser = query('GetUser', 'Get a user');

        when(getUser).then(
          resolve(getUser, (payload) => {
            return { userId: '123' };
          }),
        );
      },
    );

    // ---
    expect(spec).toEqual([
      {
        meta: undefined,
        name: 'CreateUser',
        title: 'Creates a user',
        type: 'Command',
      },
      {
        meta: undefined,
        name: 'UserCreated',
        title: 'User created',
        type: 'Event',
      },
      {
        meta: undefined,
        name: 'UserNotCreated',
        title: 'User NOT created',
        type: 'Event',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
          },
        ],
        subject: {
          meta: undefined,
          name: 'CreateUser',
          title: 'Creates a user',
          type: 'Command',
        },
        type: 'When',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
          },
        ],
        subject: {
          subject: {
            meta: undefined,
            name: 'CreateUser',
            title: 'Creates a user',
            type: 'Command',
          },
          type: 'Requested',
        },
        type: 'When',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                meta: undefined,
                name: 'CreateUser',
                title: 'Creates a user',
                type: 'Command',
              },
              type: 'Resolve',
            },
            type: 'Then',
          },
        ],
        subject: {
          meta: undefined,
          name: 'UserCreated',
          title: 'User created',
          type: 'Event',
        },
        type: 'When',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                meta: undefined,
                name: 'CreateUser',
                title: 'Creates a user',
                type: 'Command',
              },
              type: 'Reject',
            },
            type: 'Then',
          },
        ],
        subject: {
          meta: undefined,
          name: 'UserNotCreated',
          title: 'User NOT created',
          type: 'Event',
        },
        type: 'When',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
          },
        ],
        subject: {
          subject: {
            meta: undefined,
            name: 'CreateUser',
            title: 'Creates a user',
            type: 'Command',
          },
          type: 'Resolved',
        },
        type: 'When',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
          },
        ],
        subject: {
          subject: {
            meta: undefined,
            name: 'CreateUser',
            title: 'Creates a user',
            type: 'Command',
          },
          type: 'Rejected',
        },
        type: 'When',
      },
      {
        meta: undefined,
        name: 'GetUser',
        title: 'Get a user',
        type: 'Query',
      },
      {
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                meta: undefined,
                name: 'GetUser',
                title: 'Get a user',
                type: 'Query',
              },
              type: 'Resolve',
            },
            type: 'Then',
          },
        ],
        subject: {
          meta: undefined,
          name: 'GetUser',
          title: 'Get a user',
          type: 'Query',
        },
        type: 'When',
      },
    ]);
    // ---
  });

  it('works v2', () => {
    const specify = SpecifyFlow(undefined);

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
        query,
        loop,
        map,
        entity,
        state,
      }) => {
        const createUser = command('CreateUser', 'Creates a user');
        const users = entity<{ id: string; name: string }>(
          'users',
          'Users',
          ({ id }) => String(id),
        );

        // case 1 / sync
        when(createUser).then(
          resolve(createUser, async (payload, { emit, call }) => {
            const user = await call('GetUser', { userId: '123' });
            return user;
          }),
        );

        // case 2 / async
        when(createUser)
          .then(async (input, { emit, call, request }) => {
            return request('GetUser', { userId: '123' });
          })
          .then(
            loop(async (loopContext, { produce, input: user, emit }) => {
              await produce(user);
              return null; // next context; null means exit;
            }),
          )
          .then(
            // consider value or stream of values like an item and handle item by item and returns the stream to the next step;
            map(async (user, { value, set }) => {
              await set(users, user);
              return value(user);
            }),
          )
          .then(async (userStream, { value, toArray }) => {
            const users = await toArray(userStream);
            return value(users[0]);
          })
          .then(
            async (user, { all, value, request, waitFor, toArray, stream }) => {
              // pooling
              await waitFor(() => true);

              // in case of request
              const resultInSync = await waitFor(
                request('GetUser', { userId: '345' }),
              );

              // in case of stream of requests
              const resultsInSync = await waitFor(
                stream(
                  all([value(user), request('GetUser', { userId: '345' })]),
                ),
              );

              const streamOfResultsInSync = await stream(
                all([value(user), request('GetUser', { userId: '345' })]),
              );

              const results = await toArray(streamOfResultsInSync);

              // async approach
              return all([value(user), request('GetUser', { userId: '345' })]);
            },
          )
          .then(
            resolve(createUser, async (userStream, { toArray }) => {
              // output of ALL: is always stream of results
              const [user1, user2] = await toArray(
                userStream as StreamX<unknown>,
              );
              return user1;
            }),
          );
      },
    );

    // ---
    // expect(spec).toEqual(111);
    // ---
  });
});
