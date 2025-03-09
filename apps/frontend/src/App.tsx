import React, { useEffect, useState } from 'react';
import './App.css';

import io from 'socket.io-client';
import { IType } from '@repo/typex';
const socket = io('http://localhost:4000');


function App() {

  const [message, setMessage] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Listen for "notification" event from the server
    socket.on('notification', (msg: string) => {
      setNotifications((prev) => [...prev, msg]);
    });

    sendMessage({type: 'Hello IO'});

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

  useEffect(
    () => {
      async function app() {
        // send post
        const response = await fetch('http://localhost:4000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'Hello',
          }),
        });

        console.log(await response.json());
      }

      app()
        .catch((error) => console.error(error));

    },
    []
  )
  return (
    <div className="App">
     hey
    </div>
  );
}

export default App;
