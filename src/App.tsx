/**
 * App Component
 * Root application component with routing
 */

import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { lightTheme, darkTheme } from '@/theme';
import { ThemeProvider, useThemeMode, AuthProvider, ToastProvider } from '@/contexts';
import { MainLayout } from '@/layouts';
import { ErrorBoundary, LoadingSpinner } from '@/common/components';
import { routes } from '@/routes';
import { setPageMetadata } from '@/utils/metadata';
import { ROUTES } from "@/constants";

/**
 * RouteMetadata Component
 * Updates page metadata based on current route
 */
const RouteMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    // Find current route and apply metadata
    const currentRoute = routes.find((route) => {
      if (!route.path) return false;
      if (route.path === location.pathname) return true;
      if (route.path.includes(':')) {
        // Handle dynamic routes (basic pattern matching)
        const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(location.pathname);
      }
      return false;
    });

    if (currentRoute?.metadata) {
      setPageMetadata(currentRoute.metadata);
    }
  }, [location.pathname]);

  return null;
};

/**
 * Router Component
 * Handles route rendering
 */
const Router = () => {
  return (
    <>
      <RouteMetadata />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </>
  );
};

/**
 * AppContent Component
 * Wraps content with MUI theme provider using theme mode from context
 */
const AppContent = () => {
  const { mode } = useThemeMode();
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <ToastProvider>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Router />
                </Suspense>
              </MainLayout>
            </ToastProvider>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
};

/**
 * App Component
 * Main application component
 */
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
