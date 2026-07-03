import { MenuItem, TextField, type TextFieldProps } from "@mui/material";
import { resolveFieldError } from "./Input";

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = Omit<
  TextFieldProps,
  "name" | "error" | "helperText" | "select"
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
  /** Extra options forwarded to `register`. */
  rules?: Record<string, any>;
  /** Declarative options. Falls back to `children` when omitted. */
  options?: SelectOption[];
  /** Text shown as a disabled item when `options` is an empty array. */
  emptyText?: string;
  /** Explicit overrides — take precedence over derived error state. */
  error?: boolean;
  helperText?: React.ReactNode;
};

export const Select = ({
  label,
  name,
  required = false,
  register,
  errors,
  isSubmitting = false,
  rules,
  options,
  emptyText = "No options available",
  disabled,
  margin = "none",
  error,
  helperText,
  children,
  ...props
}: SelectProps) => {
  const fieldError = resolveFieldError(errors, name);

  const registerProps =
    register && name
      ? register(name, {
          required: required ? `${label} is required` : false,
          ...rules,
        })
      : {};

  return (
    <TextField
      select
      fullWidth
      margin={margin}
      label={label}
      id={name}
      required={required}
      disabled={disabled ?? isSubmitting}
      variant="outlined"
      error={error ?? !!fieldError}
      helperText={helperText ?? fieldError?.message}
      InputLabelProps={{
        shrink: true,
      }}
      {...registerProps}
      {...props}
    >
      {options
        ? options.length > 0
          ? options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))
          : <MenuItem disabled>{emptyText}</MenuItem>
        : children}
    </TextField>
  );
};
