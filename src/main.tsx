import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './Pages/LatterError/ErrorBoundary';
import { DatasetProvider } from './contexts/DatasetContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    {/* This ErrorBoundary is the last line of defense for the application.
    So if something goes so wrong that the application crashes,
    this will catch it and show a friendly error message. */}
    <ErrorBoundary>
      <DatasetProvider>
        <App />
      </DatasetProvider>
    </ErrorBoundary>
  </StrictMode>
);