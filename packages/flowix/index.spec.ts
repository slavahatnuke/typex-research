import { describe, expect, it } from 'vitest';
import { DefineFlow } from './index';
import { TestId } from './fastId';

describe(DefineFlow.name, () => {
  it('should return an array of commands, queries, events, and whens', () => {
    const defineFlow = DefineFlow(undefined, { NewId: TestId() });

    const spec = defineFlow(
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

    expect(spec).toEqual([
      {
        title: 'Creates a user',
        id: '0',
        meta: undefined,
        name: 'CreateUser',
        type: 'Command',
      },
      {
        title: 'User created',
        id: '1',
        meta: undefined,
        name: 'UserCreated',
        type: 'Event',
      },
      {
        title: 'User NOT created',
        id: '2',
        meta: undefined,
        name: 'UserNotCreated',
        type: 'Event',
      },
      {
        id: '3',
        meta: undefined,
        subject: {
          title: 'Creates a user',
          id: '0',
          meta: undefined,
          name: 'CreateUser',
          type: 'Command',
        },
        type: 'When',
      },
      {
        id: '4',
        meta: undefined,
        then: expect.any(Function),
        type: 'Then',
        when: {
          id: '3',
          meta: undefined,
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'When',
        },
      },
      {
        id: '5',
        meta: undefined,
        subject: {
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'Requested',
        },
        type: 'When',
      },
      {
        id: '6',
        meta: undefined,
        then: expect.any(Function),
        type: 'Then',
        when: {
          id: '5',
          meta: undefined,
          subject: {
            subject: {
              title: 'Creates a user',
              id: '0',
              meta: undefined,
              name: 'CreateUser',
              type: 'Command',
            },
            type: 'Requested',
          },
          type: 'When',
        },
      },
      {
        id: '7',
        meta: undefined,
        subject: {
          title: 'User created',
          id: '1',
          meta: undefined,
          name: 'UserCreated',
          type: 'Event',
        },
        type: 'When',
      },
      {
        id: '8',
        meta: undefined,
        then: {
          handler: expect.any(Function),
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'Resolve',
        },
        type: 'Then',
        when: {
          id: '7',
          meta: undefined,
          subject: {
            title: 'User created',
            id: '1',
            meta: undefined,
            name: 'UserCreated',
            type: 'Event',
          },
          type: 'When',
        },
      },
      {
        id: '9',
        meta: undefined,
        subject: {
          title: 'User NOT created',
          id: '2',
          meta: undefined,
          name: 'UserNotCreated',
          type: 'Event',
        },
        type: 'When',
      },
      {
        id: '10',
        meta: undefined,
        then: {
          handler: expect.any(Function),
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'Reject',
        },
        type: 'Then',
        when: {
          id: '9',
          meta: undefined,
          subject: {
            title: 'User NOT created',
            id: '2',
            meta: undefined,
            name: 'UserNotCreated',
            type: 'Event',
          },
          type: 'When',
        },
      },
      {
        id: '11',
        meta: undefined,
        subject: {
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'Resolved',
        },
        type: 'When',
      },
      {
        id: '12',
        meta: undefined,
        then: expect.any(Function),
        type: 'Then',
        when: {
          id: '11',
          meta: undefined,
          subject: {
            subject: {
              title: 'Creates a user',
              id: '0',
              meta: undefined,
              name: 'CreateUser',
              type: 'Command',
            },
            type: 'Resolved',
          },
          type: 'When',
        },
      },
      {
        id: '13',
        meta: undefined,
        subject: {
          subject: {
            title: 'Creates a user',
            id: '0',
            meta: undefined,
            name: 'CreateUser',
            type: 'Command',
          },
          type: 'Rejected',
        },
        type: 'When',
      },
      {
        id: '14',
        meta: undefined,
        then: expect.any(Function),
        type: 'Then',
        when: {
          id: '13',
          meta: undefined,
          subject: {
            subject: {
              title: 'Creates a user',
              id: '0',
              meta: undefined,
              name: 'CreateUser',
              type: 'Command',
            },
            type: 'Rejected',
          },
          type: 'When',
        },
      },
    ]);
  });
});
