import React, { useEffect, useState } from 'react';
import './App.css';

import io from 'socket.io-client';
import { IType, SubscribeService } from '@slavax/typex';
import { App, IApp } from '@typex-reserach/app';
import { HttpAsService } from '@slavax/typex/HttpAsService';
import { sequence } from '@slavax/streamx/sequence';
import { map } from '@slavax/streamx/map';
import { tap } from '@slavax/streamx/tap';
import { batch } from '@slavax/streamx/batch';
import { flat } from '@slavax/streamx/flat';
import { run } from '@slavax/streamx/run';
import { of } from '@slavax/streamx/of';
import { SpeedTest } from '@slavax/funx/speed-test';
import { relaxedTimeout } from '@slavax/streamx/relaxedTimeout';
import { relaxedBatch } from '@slavax/streamx/relaxedBatch';

const serviceUrl = 'http://localhost:4000/';

const socket = io(serviceUrl);
type IFrontendContext = {
  type: 'FrontendContext';
  userToken: string;
  traceId: string;
};
const service = HttpAsService<IApp, IFrontendContext>(serviceUrl);

const subscribeService = SubscribeService(service);

const unsubscribeService = subscribeService((message) => {
  console.log(message);
});

const shortId = () => Math.random().toString(16).slice(2);

const userToken = `user-token-${shortId()}`;

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

    void (async function () {
      const speedTest = SpeedTest({
        every: 1000,
      });

      const stream = of(sequence(5_000))
        .pipe(map((input) => `Hello number: ${input}`))
        .pipe(relaxedBatch(1000))
        .pipe(tap(() => speedTest.track()));
      // .pipe(tap(console.log));

      await run(stream);
    })();

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
