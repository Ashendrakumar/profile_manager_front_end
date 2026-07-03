/**
 * Login Page
 * User login form with validation
 */

import { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Typography, Link, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";
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

/**
 * Login Page Component
 */
const LoginPage = () => {
  const navigate = useNavigate();
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
      navigate(ROUTES.HOME, { replace: true });
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
          sx={{ mt: 5, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
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
