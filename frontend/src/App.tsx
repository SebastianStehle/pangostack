import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { RouteWhenPrivate, ThemeProvider, ThemeStyle, ThemeTitle, TransientNavigate, TransientProvider } from './components';
import { DialogProvider } from './components/DialogProvider';
import { InternalPage } from './pages/InternalPage';
import { LoginPage } from './pages/login/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 1000,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TransientProvider>
          <ThemeProvider>
            <DialogProvider>
              <ThemeStyle />
              <ThemeTitle />

              <Routes>
                <Route
                  path="/*"
                  element={
                    <RouteWhenPrivate>
                      <InternalPage />
                    </RouteWhenPrivate>
                  }
                />

                <Route path="/login" element={<LoginPage />} />

                <Route path="*" element={<TransientNavigate to="/" />} />
              </Routes>
            </DialogProvider>

            <Tooltip id="default" />
            <ToastContainer />
          </ThemeProvider>
        </TransientProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
