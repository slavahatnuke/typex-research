import React from 'react';

export function NewReactProvider<Context extends Record<any, any>>(name: string) {
  const noContextReason = `Provider:${name}:NO_CONTEXT`;
  const noContextSymbol = Symbol(noContextReason);

  const ProviderContext: React.Context<Context> = React.createContext<Context>(
    noContextSymbol as unknown as Context,
  );

  const Provider = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: Context;
  }) => {
    return (
      <ProviderContext.Provider value={value}>
        {children}
      </ProviderContext.Provider>
    );
  };

  const useProvider = () => {
    const context = React.useContext(ProviderContext);
    // @ts-ignore
    if (context === noContextSymbol) {
      throw new Error(noContextReason);
    }
    return context;
  };

  return [Provider, useProvider] as const;
}
