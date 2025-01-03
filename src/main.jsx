import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './Pages/LatterError/ErrorBoundary.jsx';
import store from './store/store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App/>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);