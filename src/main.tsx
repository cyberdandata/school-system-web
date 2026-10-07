import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Create a client
const queryClient = new QueryClient();

// @ts-ignore
class ErrorBoundary extends React.Component<any, any> {
  state: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', height: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Fatal App Crash 💥</h1>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Please send this exact error message back to the AI assistant:</p>
          <div style={{ marginTop: '20px', padding: '15px', background: 'white', border: '2px solid #ef4444', borderRadius: '8px', overflow: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{this.state.error?.toString()}</h2>
            <pre style={{ marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 20px; background: #fef2f2; color: #991b1b; height: 100vh; font-family: monospace;">
        <h1 style="font-size: 24px; font-weight: bold;">Fatal Setup Crash 💥</h1>
        <p style="margin-top: 10px; font-size: 14px;">Please send this exact error message back to the AI assistant:</p>
        <div style="margin-top: 20px; padding: 15px; background: white; border: 2px solid #ef4444; border-radius: 8px;">
          <h2 style="font-size: 18px; font-weight: bold;">${message}</h2>
          <p style="margin-top: 10px; font-size: 12px;">${source}:${lineno}:${colno}</p>
        </div>
      </div>
    `;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
