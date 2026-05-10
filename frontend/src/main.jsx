import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import './styles/dashboard.css';
import './styles/login.css';
import './styles/language-switcher.css';
import './styles/tabs.css';
import './styles/rich-text.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
