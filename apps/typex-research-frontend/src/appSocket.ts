import io from 'socket.io-client';

import { APP_SERVICE_URL } from './AppService';

export const appSocket = io(APP_SERVICE_URL);