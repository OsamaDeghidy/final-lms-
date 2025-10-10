import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { HelmetProvider } from 'react-helmet-async';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import store from './store/store';
import theme from './theme';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

console.log('Application is starting...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  console.log('Root element found, rendering application...');
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  });
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                  <App />
                </QueryClientProvider>
              </HelmetProvider>
            </BrowserRouter>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
