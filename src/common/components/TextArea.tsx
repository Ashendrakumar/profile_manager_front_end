import { TextField, type TextFieldProps } from "@mui/material";
import { resolveFieldError } from "./Input";

export type TextAreaProps = Omit<
  TextFieldProps,
  "name" | "error" | "helperText" | "multiline"
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
  /** Number of visible rows (ignored when minRows/maxRows are used). */
  rows?: number;
  /** Explicit overrides — take precedence over derived error state. */
  error?: boolean;
  helperText?: React.ReactNode;
};

export const TextArea = ({
  label,
  name,
  required = false,
  register,
  errors,
  isSubmitting = false,
  rules,
  rows = 4,
  disabled,
  margin = "none",
  error,
  helperText,
  minRows,
  maxRows,
  ...props
}: TextAreaProps) => {
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
      fullWidth
      multiline
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
      {...(minRows || maxRows ? { minRows, maxRows } : { rows })}
      {...registerProps}
      {...props}
    />
  );
};
