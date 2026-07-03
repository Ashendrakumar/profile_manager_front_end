import { useMemo, useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  type TextFieldProps,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

/**
 * Resolve a (possibly nested) react-hook-form error by field name.
 * Supports dotted paths such as `phones.0.number` used by field arrays.
 */
export const resolveFieldError = (errors: any, name?: string) => {
  if (!errors || !name) return undefined;
  return name
    .split(".")
    .reduce((acc: any, key) => (acc ? acc[key] : undefined), errors);
};

export type TextInputProps = Omit<
  TextFieldProps,
  "name" | "error" | "helperText"
> & {
  label: string;
  /** Field name. Required when using `register`/`errors`. */
  name?: string;
  required?: boolean;
  /** react-hook-form register function (optional for controlled usage). */
  register?: any;
  /** react-hook-form errors object (optional). */
  errors?: any;
  /** Disables the field while a form is submitting. */
  isSubmitting?: boolean;
  /** Extra options forwarded to `register` (e.g. `{ valueAsNumber: true }`). */
  rules?: Record<string, any>;
  type?: string;
  /** Explicit overrides — take precedence over derived error state. */
  error?: boolean;
  helperText?: React.ReactNode;
};

export const Input = ({
  label,
  name,
  required = false,
  register,
  errors,
  isSubmitting = false,
  rules,
  type = "text",
  disabled,
  margin = "none",
  error,
  helperText,
  InputProps,
  ...props
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const memoizedType = useMemo(
    () => (isPassword ? (showPassword ? "text" : "password") : type),
    [isPassword, showPassword, type],
  );

  const fieldError = resolveFieldError(errors, name);

  const registerProps =
    register && name
      ? register(name, {
          required: required ? `${label} is required` : false,
          ...rules,
        })
      : {};

  const passwordAdornment = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={() => setShowPassword((prev) => !prev)}
          edge="end"
        >
          {showPassword ? (
            <VisibilityOff color="inherit" />
          ) : (
            <Visibility color="inherit" />
          )}
        </IconButton>
      </InputAdornment>
    ),
  };

  return (
    <TextField
      fullWidth
      margin={margin}
      label={label}
      id={name}
      required={required}
      disabled={disabled ?? isSubmitting}
      autoComplete={name}
      variant="outlined"
      type={memoizedType}
      error={error ?? !!fieldError}
      helperText={helperText ?? fieldError?.message}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={
        isPassword ? { ...passwordAdornment, ...InputProps } : InputProps
      }
      {...registerProps}
      {...props}
    />
  );
};
