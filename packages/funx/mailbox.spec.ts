import { Mailbox } from './mailbox';
import { Collect } from './collect';

import { describe, expect, test } from 'vitest';

describe(Mailbox.name, () => {
  test('mailbox', () => {
    const { inbox, outbox } = Mailbox<number, number>();
    const inboxMessages = Collect();
    const unsubscribeInbox = inbox.subscribe(inboxMessages);

    const outboxMessages = Collect();
    const unsubscribeOutbox = outbox.subscribe(outboxMessages);

    expect(inboxMessages()).toEqual([]);
    expect(outboxMessages()).toEqual([]);

    inbox.publish(1);
    inbox.publish(2);

    expect(inboxMessages()).toEqual([1, 2]);
    expect(outboxMessages()).toEqual([]);

    outbox.publish(10);

    expect(inboxMessages()).toEqual([1, 2]);
    expect(outboxMessages()).toEqual([10]);

    unsubscribeInbox();
    unsubscribeOutbox();

    inbox.publish(3);
    outbox.publish(20);

    expect(inboxMessages()).toEqual([1, 2]);
    expect(outboxMessages()).toEqual([10]);
  });
});
