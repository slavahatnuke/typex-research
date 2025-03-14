import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppView from './AppView';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './AppContextProvider';
import { appService, AppServiceProvider } from './AppService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <AppServiceProvider value={appService}>
      <AppContextProvider value={{ appName: 'MyApp' }}>
        <AppView />
      </AppContextProvider>
    </AppServiceProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
