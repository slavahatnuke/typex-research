import { HttpAsService } from '@slavax/typex/HttpAsService';
import { IApp, IAppContext } from '@typex-reserach/app';
import { SubscribeService } from '@slavax/typex';
import { ServiceProvider } from './lib/ServiceProvider';
import { AppContext } from './AppContext';

export const APP_SERVICE_URL = 'http://localhost:4000/';

export const appService = HttpAsService<IApp, IAppContext>(APP_SERVICE_URL);

const subscribeService = SubscribeService(appService);
const unsubscribeService = subscribeService((serviceEvent) => {
  console.log('[event.log]', serviceEvent);
});

export const [AppServiceProvider, useAppApi, useAppEvents] =
  ServiceProvider('AppService', appService, () => AppContext());
