/**
 * Login Page
 * User login form with validation + Google OAuth sign-in
 */

import { useEffect } from "react";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Typography,
  Link,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { useAuth } from "@/contexts";
import { ROUTES, GOOGLE_AUTH_URL } from "@/constants";
import { Input } from "@/common/components/Input";

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Human-readable messages for OAuth error codes sent as query params */
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_access_denied: "Google sign-in was cancelled. Please try again.",
  google_no_code: "Google did not return an authorization code. Please try again.",
  google_init_failed: "Failed to start Google sign-in. Please try again.",
  google_auth_failed: "Google authentication failed. Please try again.",
};

/**
 * Google "G" Logo SVG — official brand colour mark
 */
const GoogleLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

/**
 * Login Page Component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Watch form values to clear global error on change
  const emailValue = watch("email");
  const passwordValue = watch("password");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(ROUTES.PROFILE_COMPLETION, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Clear global error when form values change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [emailValue, passwordValue, error, clearError]);

  /**
   * Handle form submit
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  /**
   * Redirect browser to backend Google OAuth initiation URL.
   * The backend will set the OAuth state and redirect to Google.
   */
  const handleGoogleSignIn = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  // OAuth error passed as a query param from the Google callback page
  const oauthErrorCode = searchParams.get("error");
  const oauthErrorMessage = oauthErrorCode
    ? (OAUTH_ERROR_MESSAGES[oauthErrorCode] ?? "Google sign-in failed. Please try again.")
    : null;

  return (
    <>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Welcome back to{" "}
        <Typography
          component="span"
          variant="h4"
          sx={{ color: "primary.main" }}
        >
          {" "}
          Profile Manager
        </Typography>
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 3 }}
      >
        Sign in to your account to continue ...
      </Typography>

      {/* OAuth error banner */}
      {oauthErrorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {oauthErrorMessage}
        </Alert>
      )}

      {/* ── Email / Password Form ─────────────────────────────────────────── */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          name="email"
          margin="normal"
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          margin="normal"
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 4 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
        </Button>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
          or sign in with email
        </Typography>
      </Divider>

      {/* ── Google Sign-In Button ─────────────────────────────────────────── */}
      <Button
        id="google-signin-btn"
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        startIcon={<GoogleLogo />}
        sx={{
          mb: 2,
          py: 1.25,
          borderColor: "divider",
          color: "text.primary",
          fontWeight: 500,
          fontSize: "0.9rem",
          textTransform: "none",
          gap: 1,
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        Continue with Google
      </Button>

        <Box textAlign="center">
          Don't have an account?
          <Link component={RouterLink} to={ROUTES.REGISTER} variant="button">
            {" "}
            Sign Up
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
