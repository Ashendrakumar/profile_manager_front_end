/**
 * Admin Guard Component
 * Protects routes that require admin role
 */

import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/contexts';
import { ROUTES } from '@/constants';

interface AdminGuardProps {
  children: React.ReactElement;
}

/**
 * Admin Guard Component
 * Redirects non-admin users to home page
 * Must be used inside AuthGuard to ensure user is authenticated first
 */
export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading } = useAuth();

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

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Redirect to home if not admin
  if (!isAdmin) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Navigate to={ROUTES.HOME} replace />
      </Box>
    );
  }

  return children;
};
