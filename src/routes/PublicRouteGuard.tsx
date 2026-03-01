/**
 * Public Route Guard Component
 * Redirects authenticated users away from public routes (login/register)
 */

import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts';
import { ROUTES } from '@/constants';

interface PublicRouteGuardProps {
  children: React.ReactElement;
}

/**
 * Public Route Guard Component
 * Redirects authenticated users to home page
 */
export const PublicRouteGuard = ({ children }: PublicRouteGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};
