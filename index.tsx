import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <FirebaseAuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);