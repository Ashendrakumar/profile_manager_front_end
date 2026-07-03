/**
 * Register Page
 * User registration form with validation
 */

import { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Typography, Link, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";
import { Input } from "@/common/components";

/**
 * Register form validation schema
 */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const formFields = [
  {
    label: "Full Name",
    name: "username",
    type: "text",
    required: true,
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    required: true,
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    required: true,
  },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    type: "password",
    required: true,
  },
];

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register Page Component
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register: registerUser,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch form values to clear global error on change
  const usernameValue = watch("username");
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

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
  }, [
    usernameValue,
    emailValue,
    passwordValue,
    confirmPasswordValue,
    error,
    clearError,
  ]);

  /**
   * Handle form submit
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (err) {
      // Error is handled by auth context
      console.error("Registration error:", err);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Welcome to
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
        Create an account to explore our features and start managing your
        profile ...
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formFields.map((field) => (
          <Input
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            margin="normal"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            required={field.required}
          />
        ))}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 4, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Sign Up"}
        </Button>

        <Box textAlign="center">
          Already have an account?
          <Link component={RouterLink} to={ROUTES.LOGIN} variant="button">
            {" "}
            Sign In
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default RegisterPage;
