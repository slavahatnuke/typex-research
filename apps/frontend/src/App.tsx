import React, { useEffect, useState } from 'react';
import './App.css';

import io from 'socket.io-client';
import { IType } from '@repo/typex';
import { ServiceAsFetch } from '@repo/typex/ServiceAsFetch';

const socket = io('http://localhost:4000');

function App() {
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
    async function app() {
      // send post
      const url = 'http://localhost:4000';

      const input = {
        type: 'Hello',
      };

      const service = ServiceAsFetch<any>(url);
      console.log(await service(input.type, input));
    }

    app().catch((error) => console.error(error));
  }, []);
  return <div className="App">hey</div>;
}

export default App;
