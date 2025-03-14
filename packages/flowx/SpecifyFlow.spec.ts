import { describe, expect, it } from 'vitest';
import { SpecifyFlow } from './SpecifyFlow';
import { FastIncrementalId } from '@slavax/funx/fastId';
import { StreamX } from '@slavax/streamx';

describe(SpecifyFlow.name, () => {
  it('should return an array of commands, queries, events, and whens', () => {
    const specify = SpecifyFlow(undefined, { NewId: FastIncrementalId() });

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
        id: '0',
        meta: undefined,
        name: 'CreateUser',
        title: 'Creates a user',
        type: 'Command',
      },
      {
        id: '1',
        meta: undefined,
        name: 'UserCreated',
        title: 'User created',
        type: 'Event',
      },
      {
        id: '2',
        meta: undefined,
        name: 'UserNotCreated',
        title: 'User NOT created',
        type: 'Event',
      },
      {
        id: '3',
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
            whenId: '3',
          },
        ],
        subject: {
          id: '0',
          meta: undefined,
          name: 'CreateUser',
          title: 'Creates a user',
          type: 'Command',
        },
        type: 'When',
      },
      {
        id: '4',
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
            whenId: '4',
          },
        ],
        subject: {
          subject: {
            id: '0',
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
        id: '5',
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                id: '0',
                meta: undefined,
                name: 'CreateUser',
                title: 'Creates a user',
                type: 'Command',
              },
              type: 'Resolve',
            },
            type: 'Then',
            whenId: '5',
          },
        ],
        subject: {
          id: '1',
          meta: undefined,
          name: 'UserCreated',
          title: 'User created',
          type: 'Event',
        },
        type: 'When',
      },
      {
        id: '6',
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                id: '0',
                meta: undefined,
                name: 'CreateUser',
                title: 'Creates a user',
                type: 'Command',
              },
              type: 'Reject',
            },
            type: 'Then',
            whenId: '6',
          },
        ],
        subject: {
          id: '2',
          meta: undefined,
          name: 'UserNotCreated',
          title: 'User NOT created',
          type: 'Event',
        },
        type: 'When',
      },
      {
        id: '7',
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
            whenId: '7',
          },
        ],
        subject: {
          subject: {
            id: '0',
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
        id: '8',
        meta: undefined,
        steps: [
          {
            handler: expect.any(Function),
            type: 'Then',
            whenId: '8',
          },
        ],
        subject: {
          subject: {
            id: '0',
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
        id: '9',
        meta: undefined,
        name: 'GetUser',
        title: 'Get a user',
        type: 'Query',
      },
      {
        id: '10',
        meta: undefined,
        steps: [
          {
            handler: {
              handler: expect.any(Function),
              subject: {
                id: '9',
                meta: undefined,
                name: 'GetUser',
                title: 'Get a user',
                type: 'Query',
              },
              type: 'Resolve',
            },
            type: 'Then',
            whenId: '10',
          },
        ],
        subject: {
          id: '9',
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
    const specify = SpecifyFlow(undefined, { NewId: FastIncrementalId() });

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
          .then(async (user, { value }) => {
            return value(user);
          })
          .then(
            async (
              user,
              { all, value, request, waitFor, toArray, stream, loop },
            ) => {
              // pooling
              await waitFor(() => true);

              // loops
              const loopResults = await waitFor(
                loop<{ page: number }>((fetchingContext) => {
                  if (fetchingContext) {
                    if (fetchingContext.page > 10) {
                      return null;
                    }

                    return { page: fetchingContext.page + 1 };
                  }
                  return { page: 1 };
                }),
              );

              const loopToStream = stream(
                loop((loopContext, produce) => {
                  produce('LoopIsOk');
                  return null;
                }),
              );

              const loopResultsFromStream = await toArray(loopToStream);

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
              // return all([value(user), request('GetUser', { userId: '345' })]);

              // async approach for loop
              return all(loop(() => null));
              // return loop(() => null);
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
