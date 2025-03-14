import { NewProvider } from './lib/NewProvider';

export const [AppContextProvider, useAppContext] = NewProvider<{
  appName: string;
}>('AppContext');
