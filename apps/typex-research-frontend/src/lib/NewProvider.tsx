import React, { Dispatch, useMemo, useState } from 'react';
import { NewReactProvider } from './NewReactProvider';

type IProviderContext<State = unknown> = {
  state: State;
  setState: Dispatch<State | ((prevState: State) => State)>;
};

export function NewProvider<State = unknown>(name: string) {
  const [RootProvider, useRootProvider] =
    NewReactProvider<IProviderContext<State>>(name);

  const Provider = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: State;
  }) => {
    const [state, setState] = useState<State>(value);

    const memo = useMemo<IProviderContext<State>>(
      () => ({ state, setState }),
      [state, setState],
    );

    return <RootProvider value={memo}>{children}</RootProvider>;
  };

  const useContext = () => {
    const context = useRootProvider();
    return [context.state, context.setState] as const;
  };

  return [Provider, useContext] as const;
}
