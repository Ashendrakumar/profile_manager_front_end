/**
 * RouteGuard — Unified route protection component
 *
 * Replaces AuthGuard + AdminGuard + PublicRouteGuard.
 * Reads intent from props and handles all redirect/access logic in one place.
 *
 * Usage in routes config:
 *   <RouteGuard isPublic>        → redirects authenticated users away
 *   <RouteGuard isProtected>     → redirects unauthenticated users to login
 *   <RouteGuard requiresAdmin>   → requires auth + admin role
 */

import { Navigate, useLocation } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";
import { LoadingSpinner } from "@/common/components";

interface RouteGuardProps {
  children: React.ReactElement;
  /** Public-only route: redirect authenticated users away (e.g. login, register) */
  isPublic?: boolean;
  /** Protected route: redirect unauthenticated users to login */
  isProtected?: boolean;
  /** Admin-only route: requires authentication + admin role */
  requiresAdmin?: boolean;
}

export const RouteGuard = ({
  children,
  isPublic,
  isProtected,
  requiresAdmin,
}: RouteGuardProps) => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isInitializing) {
    return <LoadingSpinner fullScreen />;
  }

  // ── Public-only route (login / register / OTP) ───────────────────────────────
  // Authenticated users have no business here — send them home.
  if (isPublic && isAuthenticated) {
    return <Navigate to={ROUTES.PROFILE_COMPLETION} replace />;
  }

  // ── Protected route ──────────────────────────────────────────────────────────
  // Save attempted path so we can redirect back after login.
  if ((isProtected || requiresAdmin) && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // ── Admin-only route ─────────────────────────────────────────────────────────
  if (requiresAdmin && user?.role !== "admin") {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100dvh"
        gap={2}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to view this page.
        </Typography>
        <Button
          variant="outlined"
          component={() => <Navigate to={ROUTES.PROFILE_COMPLETION} replace />}
        />
      </Box>
    );
  }

  return children;
};
