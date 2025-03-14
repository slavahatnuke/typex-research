import { HttpAsService } from '@slavax/typex/HttpAsService';
import { IApp, IAppContext } from '@typex-reserach/app';
import { SubscribeService } from '@slavax/typex';
import { ServiceNativeProvider } from './lib/ServiceNativeProvider';

export const APP_SERVICE_URL = 'http://localhost:4000/';

export const appService = HttpAsService<IApp, IAppContext>(APP_SERVICE_URL);

const subscribeService = SubscribeService(appService);
const unsubscribeService = subscribeService((message) => {
  console.log(message);
});

export const [NativeServiceProvider, useNativeServiceProvider] =
  ServiceNativeProvider('AppService', appService);
