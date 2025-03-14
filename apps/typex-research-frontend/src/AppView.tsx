import React, { useEffect, useState } from 'react';
import './App.css';

import io from 'socket.io-client';
import { IType, SubscribeService } from '@slavax/typex';
import { App, IApp } from '@typex-reserach/app';
import { HttpAsService } from '@slavax/typex/HttpAsService';
import { sequence } from '@slavax/streamx/sequence';
import { tap } from '@slavax/streamx/tap';
import { run } from '@slavax/streamx/run';
import { of } from '@slavax/streamx/of';
import { SpeedTest } from '@slavax/funx/speed-test';
import { relaxedBatch } from '@slavax/streamx/relaxedBatch';
import { useList } from './lib/useList';
import { FastIncrementalId } from '@slavax/funx/fastId';
import { NewProvider } from './lib/NewProvider';

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

const id = FastIncrementalId();
export const [AppProvider, useAppProvider] = NewProvider<{appName: string}>('app');

function AppView() {
  const { appName } = useAppProvider();
  const [message, setMessage] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const [items, itemsApi] = useList(
    (item: { id: number; name: string; age: number }) => String(item.id),
    [
      {
        id: id(),
        name: 'John',
        age: 25,
      },
      {
        id: id(),
        name: 'Jane',
        age: 22,
      },
    ],
  );

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
        inIntervalMilliseconds: 7000,
      });

      const stream = of(sequence(5_000))
        .pipe(relaxedBatch())
        .pipe(tap(() => speedTest.track()));
      // .pipe(tap(console.log));

      await run(stream);

      console.log('streaming >> done');
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
  return (
    <div className="App">
      <h2>Hi, I am a frontend app {appName}</h2>

      <button
        onClick={() =>
          itemsApi.add({
            id: id(),
            age: Math.floor(Math.random() * 100),
            name: `John Doe ${Math.floor(Math.random() * 100)}`,
          })
        }
      >
        add
      </button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button onClick={() => itemsApi.del(String(item.id))}>
              delById
            </button>{' '}
            <button onClick={() => itemsApi.del(item)}>delObject</button>{' '}
            <button
              onClick={() =>
                itemsApi.upsert({ ...item, name: `${item.name} Updated` })
              }
            >
              upd
            </button>{' '}
            {JSON.stringify(item, null, 2)}{' '}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppView;
