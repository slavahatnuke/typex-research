import React, { useEffect, useState } from 'react';
import './App.css';
import { IType } from '@slavax/typex';
import { App } from '@typex-reserach/app';
import { sequence } from '@slavax/streamx/sequence';
import { tap } from '@slavax/streamx/tap';
import { run } from '@slavax/streamx/run';
import { of } from '@slavax/streamx/of';
import { SpeedTest } from '@slavax/funx/speed-test';
import { relaxedBatch } from '@slavax/streamx/relaxedBatch';
import { useList } from './lib/useList';
import { FastIncrementalId } from '@slavax/funx/fastId';
import { useAppContext } from './AppContextProvider';
import { appSocket } from './appSocket';
import { useNativeServiceProvider } from './AppService';
import { AppContext } from './AppContext';

const NewId = FastIncrementalId();

function AppView() {
  const [{ appName }, setContext] = useAppContext();
  const service = useNativeServiceProvider();

  const [message, setMessage] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const [items, itemsApi] = useList(
    (item: { id: number; name: string; age: number }) => String(item.id),
    [
      {
        id: NewId(),
        name: 'John',
        age: 25,
      },
      {
        id: NewId(),
        name: 'Jane',
        age: 22,
      },
    ],
  );

  function onNotification(msg: string) {
    setNotifications((prev) => [...prev, msg]);
  }

  useEffect(() => {
    // // Listen for "notification" event from the server
    // appSocket.on('notification', (msg: any) => {
    //   onNotification(msg);
    //   console.log(msg);
    // });
    //
    // sendMessage({ type: 'Hello IO' });
    //
    // void (async function () {
    //   const speedTest = SpeedTest({
    //     every: 1000,
    //     inIntervalMilliseconds: 7000,
    //   });
    //
    //   const stream = of(sequence(5_000))
    //     .pipe(relaxedBatch())
    //     .pipe(tap(() => speedTest.track()));
    //   // .pipe(tap(console.log));
    //
    //   await run(stream);
    //
    //   console.log('streaming >> done');
    // })();

    // Cleanup the socket connection when the component unmounts
    return () => {
      // appSocket.off('notification');
    };
  }, []);

  // // Send a message to the server
  // const sendMessage = (message: IType) => {
  //   appSocket.emit('send-message', message);
  //   setMessage('');
  // };

  useEffect(() => {
    (async function () {
      console.log(await service(App.Hello, {}, AppContext()));
    })().catch((error) => console.error(error));
  }, []);
  return (
    <div className="App">
      <h2>Hi, I am a frontend app {appName}</h2>
      <button onClick={() => setContext({ appName: `${appName} Updated` })}>
        change app name
      </button>

      <button
        onClick={() =>
          itemsApi.add({
            id: NewId(),
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
