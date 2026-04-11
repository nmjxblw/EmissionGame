import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { propsManager } from './logic/propsManager';
import { initEnemies } from './logic/enemyManager';

const startApp = async () => {
  await Promise.all([propsManager.initProps(), initEnemies()]);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

startApp();
