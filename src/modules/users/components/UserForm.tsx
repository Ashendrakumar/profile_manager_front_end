/**
 * UserForm Component
 * Form for creating and editing users
 */

import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../services/userService";
import { useAuth } from "@/contexts";

const userSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(2, "Username must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string().optional(),
    role: z.enum(["admin", "user"]).optional(),
  })
  .refine(
    (data) => {
      // Password is required for new users, optional for updates
      if (!data.password && !data.role) {
        return true; // This is an update, password is optional
      }
      if (data.password) {
        return data.password.length >= 6 || data.password.length === 0;
      }
      return true;
    },
    {
      message: "Password must be at least 6 characters",
      path: ["password"],
    },
  );

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * User Form Component
 */
export const UserForm = ({
  open,
  user,
  onClose,
  onSubmit,
  loading = false,
}: UserFormProps) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    // watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
      });
    } else {
      reset({
        username: "",
        email: "",
        password: "",
        role: "user",
      });
    }
  }, [user, reset, open]);

  // const passwordValue = watch("password");

  const handleFormSubmit = async (data: UserFormData) => {
    const submitData: CreateUserRequest | UpdateUserRequest = {
      username: data.username,
      email: data.email,
    };

    // Only include password if provided (for updates) or required (for creates)
    if (!isEdit || data.password) {
      if (data.password) {
        submitData.password = data.password;
      } else if (isEdit) {
        // For updates, don't include password if empty
        delete submitData.password;
      }
    }

    // Only admins can set role
    if (isAdmin && data.role) {
      submitData.role = data.role;
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Username"
              fullWidth
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loading}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />

            <TextField
              label={
                isEdit
                  ? "New Password (leave empty to keep current)"
                  : "Password"
              }
              type="password"
              fullWidth
              {...register("password")}
              error={!!errors.password}
              helperText={
                errors.password?.message ||
                (isEdit ? "Leave empty to keep current password" : "")
              }
              disabled={loading}
            />

            {isAdmin && (
              <TextField
                label="Role"
                select
                fullWidth
                {...register("role")}
                error={!!errors.role}
                helperText={errors.role?.message}
                disabled={loading}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="medium"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
