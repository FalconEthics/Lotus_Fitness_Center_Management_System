import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './Pages/LatterError/ErrorBoundary.jsx';
import store from './store/store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* This ErrorBoundary is the last line of defense for the application.
    So if something goes so wrong that the application crashes,
    this will catch it and show a friendly error message. */}
    <ErrorBoundary>
      <Provider store={store}>
        <App/>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);