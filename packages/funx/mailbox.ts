import { IPubSub, PubSub } from './pubsub';

export type IMailbox<Inbox, Outbox = never> = Readonly<{
  inbox: IPubSub<Inbox>;
  outbox: IPubSub<Outbox>;
}>;

export function Mailbox<Inbox = never, Outbox = never>(): IMailbox<
  Inbox,
  Outbox
> {
  return {
    inbox: PubSub<Inbox>(),
    outbox: PubSub<Outbox>(),
  };
}
