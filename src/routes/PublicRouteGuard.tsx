/**
 * Public Route Guard Component
 * Redirects authenticated users away from public routes (login/register)
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";

interface PublicRouteGuardProps {
  children: React.ReactElement;
}

/**
 * Public Route Guard Component
 * Redirects authenticated users to home page
 */
export const PublicRouteGuard = ({ children }: PublicRouteGuardProps) => {
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.PROFILE_COMPLETION} replace />;
  }

  return children;
};
