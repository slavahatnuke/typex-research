import { ISyncPubSub, SyncPubSub } from './pubsub';

const ValueSymbol = Symbol('ValueSymbol');
type IValueSymbol = typeof ValueSymbol;

export type IValueInstance<T> = ((value?: T | IValueSymbol) => T) & {
  subscribe: ISyncPubSub<T>['subscribe'];
};

export type IValue<T> = T | IValueInstance<T>;

export function Value<T>(
  defaults: T | Function | IValueInstance<T>,
): IValueInstance<T> {
  if (defaults instanceof Function) {
    return defaults as IValueInstance<T>;
  }

  let value: T = defaults;

  const topic = SyncPubSub<T>();

  const valueInstance = (_value: T | IValueSymbol = ValueSymbol) => {
    if (_value !== ValueSymbol) {
      value = _value;
      topic.publish(value);
    }

    return value;
  };

  valueInstance.subscribe = topic.subscribe;

  return valueInstance;
}
