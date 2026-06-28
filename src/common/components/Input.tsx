import { useMemo, useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export type TextInputProps = {
  label: string;
  name: string;
  required?: boolean;
  register: any;
  errors: any;
  isSubmitting: boolean;
  type?: string;
};

export const Input = ({
  label,
  name,
  required = false,
  register,
  errors,
  isSubmitting,
  type = "text",
  ...props
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const memoizedType = useMemo(
    () => (isPassword ? (showPassword ? "text" : "password") : type),
    [isPassword, showPassword, type],
  );

  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      id={name}
      required={required}
      disabled={isSubmitting}
      autoComplete={name}
      variant="outlined"
      type={memoizedType}
      error={!!errors?.[name]}
      helperText={errors?.[name]?.message}
      InputProps={
        isPassword
          ? {
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
            }
          : undefined
      }
      {...register(name, {
        required: required ? `${label} is required` : false,
      })}
      {...props}
    />
  );
};
