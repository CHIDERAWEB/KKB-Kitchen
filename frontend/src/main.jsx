import React from 'react';
import ReactDOM from 'react-dom/client'; // This line fixes your error!
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Replace the string below with your actual Google Client ID */}
    <GoogleOAuthProvider clientId="261402750906-k483udkfdrdbghe4bl6a9kt38ccbchrr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);