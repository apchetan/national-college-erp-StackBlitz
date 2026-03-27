import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 20px; max-width: 600px;">
          <h1 style="color: #c00; margin: 0 0 10px 0;">Application Error</h1>
          <p style="color: #600; margin: 0;">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          <details style="margin-top: 20px; text-align: left;">
            <summary style="cursor: pointer; color: #900;">Error Details</summary>
            <pre style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
