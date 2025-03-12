import React, { useEffect, useState } from 'react';
import './App.css';

import io from 'socket.io-client';
import { IType, SubscribeService } from '@slavax/typex';
import { App, IApp } from '@typex-reserach/app';
import { HttpAsService } from '@slavax/typex/HttpAsService';

const serviceUrl = 'http://localhost:4000/';

const socket = io(serviceUrl);
type IFrontendContext = { type: 'FrontendContext'; userToken: string, traceId: string };
const service = HttpAsService<IApp, IFrontendContext>(serviceUrl);

const subscribeService = SubscribeService(service);

const unsubscribeService = subscribeService((message) => {
  console.log(message);
});

const shortId = () => Math.random().toString(16).slice(2);

const userToken = `user-token-${(shortId())}`;
function FrontendContext(
  context: Partial<IFrontendContext> = {},
): IType<IFrontendContext> {
  return {
    type: 'FrontendContext',
    userToken: userToken,
    traceId: shortId(),
    ...context,
  };
}

function AppView() {
  const [message, setMessage] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  function onNotification(msg: string) {
    setNotifications((prev) => [...prev, msg]);
  }

  useEffect(() => {
    // Listen for "notification" event from the server
    socket.on('notification', (msg: any) => {
      onNotification(msg);
      console.log(msg);
    });

    sendMessage({ type: 'Hello IO' });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.off('notification');
    };
  }, []);

  // Send a message to the server
  const sendMessage = (message: IType) => {
    socket.emit('send-message', message);
    setMessage('');
  };

  useEffect(() => {
    (async function () {
      // send post

      console.log(await service(App.Hello, {}, FrontendContext()));
    })().catch((error) => console.error(error));
  }, []);
  return <div className="App">hey</div>;
}

export default AppView;
