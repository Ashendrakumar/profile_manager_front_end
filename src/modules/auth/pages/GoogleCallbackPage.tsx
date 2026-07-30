/**
 * GoogleCallbackPage
 * Handles the frontend leg of the Google OAuth redirect.
 *
 * After the backend exchanges the Google authorization code for a JWT it
 * redirects here with these query params:
 *   ?token=<jwt>&userId=<id>&name=<name>&email=<email>&role=<role>&avatarUrl=<url>
 *
 * This page:
 *   1. Reads `token` from the query string
 *   2. Calls `loginWithToken` on the auth context (stores token + fetches /me)
 *   3. Navigates to Profile Completion on success
 *   4. Shows an error state and redirects to /login on failure
 */

import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_access_denied: "You cancelled the Google sign-in. Please try again.",
  google_no_code: "Google did not return an authorization code. Please try again.",
  google_init_failed: "Failed to start Google sign-in. Please try again.",
  google_auth_failed: "Google authentication failed. Please try again.",
};

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const hasFired = useRef(false); // Guard against double-invocation in StrictMode

  const token = searchParams.get("token");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Backend redirected with an error
    if (oauthError) {
      navigate(`${ROUTES.LOGIN}?error=${oauthError}`, { replace: true });
      return;
    }

    // No token — something went wrong
    if (!token) {
      navigate(`${ROUTES.LOGIN}?error=google_auth_failed`, { replace: true });
      return;
    }

    // Exchange token for full user profile and update auth state
    loginWithToken(token).catch(() => {
      // loginWithToken already navigates to /login on failure
    });
  }, [token, oauthError, loginWithToken, navigate]);

  // Show a user-friendly message if the error param is present in the URL
  if (oauthError) {
    const message =
      OAUTH_ERROR_MESSAGES[oauthError] ??
      "Something went wrong during Google sign-in.";
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
          px: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" color="error" fontWeight={600}>
          Sign-in Failed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        <Button
          component={RouterLink}
          to={ROUTES.LOGIN}
          variant="contained"
          sx={{ mt: 1 }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  // Default: show a full-screen loading spinner while processing
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={52} thickness={4} />
      <Typography variant="body1" color="text.secondary">
        Signing you in with Google…
      </Typography>
    </Box>
  );
};

export default GoogleCallbackPage;
