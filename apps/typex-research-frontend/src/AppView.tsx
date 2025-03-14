import React, { useEffect, useState } from 'react';
import './App.css';
import { App } from '@typex-reserach/app';
import { useList } from './lib/useList';
import { FastIncrementalId } from '@slavax/funx/fastId';
import { useAppContext } from './AppContextProvider';
import { useAppApi, useAppEvents } from './AppService';

const NewId = FastIncrementalId();

function AppView() {
  const [{ appName }, setContext] = useAppContext();
  const [sayHello, saidHello, sayHelloLoader] = useAppApi(App.Hello);

  const [someValue, setSomeValue] = useState<any>(null);

  useAppEvents([App.SaidHello], (event) => {
    console.log('event>>>', event);
    setSomeValue(event);
  });

  const [users, usersApi] = useList(
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

  useEffect(() => {
    void sayHello({});
  }, []);

  return (
    <div className="App">
      <h2>Hi, I am a frontend app {appName}</h2>
      <button onClick={() => setContext({ appName: `${appName} Updated` })}>
        change app name
      </button>

      <button
        onClick={() =>
          usersApi.add({
            id: NewId(),
            age: Math.floor(Math.random() * 100),
            name: `John Doe ${Math.floor(Math.random() * 100)}`,
          })
        }
      >
        add
      </button>
      <ul>
        {users.map((item) => (
          <li key={item.id}>
            <button onClick={() => usersApi.del(String(item.id))}>
              delById
            </button>{' '}
            <button onClick={() => usersApi.del(item)}>delObject</button>{' '}
            <button
              onClick={() =>
                usersApi.upsert({ ...item, name: `${item.name} Updated` })
              }
            >
              upd
            </button>{' '}
            {JSON.stringify(item, null, 2)}{' '}
          </li>
        ))}
      </ul>

      <h4>Loading</h4>
      {sayHelloLoader.loading && 'Loading...'}
      {sayHelloLoader.loaded && '[LOADED]'}
      {`[STATUS:${sayHelloLoader.type}]`}
      <h4>Response</h4>
      {saidHello && <pre>{JSON.stringify(saidHello, null, 2)}</pre>}
      <h4>Event</h4>
      <pre>{JSON.stringify(someValue, null, 2)}</pre>
    </div>
  );
}

export default AppView;

// const [message, setMessage] = useState<string>('');
// const [notifications, setNotifications] = useState<string[]>([]);
//
// function onNotification(msg: string) {
//   setNotifications((prev) => [...prev, msg]);
// }
//
// useEffect(() => {
//   // // Listen for "notification" event from the server
//   // appSocket.on('notification', (msg: any) => {
//   //   onNotification(msg);
//   //   console.log(msg);
//   // });
//   //
//   // sendMessage({ type: 'Hello IO' });
//   //
//   // void (async function () {
//   //   const speedTest = SpeedTest({
//   //     every: 1000,
//   //     inIntervalMilliseconds: 7000,
//   //   });
//   //
//   //   const stream = of(sequence(5_000))
//   //     .pipe(relaxedBatch())
//   //     .pipe(tap(() => speedTest.track()));
//   //   // .pipe(tap(console.log));
//   //
//   //   await run(stream);
//   //
//   //   console.log('streaming >> done');
//   // })();
//
//   // Cleanup the socket connection when the component unmounts
//   return () => {
//     // appSocket.off('notification');
//   };
// }, []);
// // Send a message to the server
// const sendMessage = (message: IType) => {
//   appSocket.emit('send-message', message);
//   setMessage('');
// };
