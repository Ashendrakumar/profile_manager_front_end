/**
 * ChangePasswordCard
 * Change (or, for Google-only accounts, set) the account password.
 */

import { Box, Button, Card, CardContent, CardHeader, Divider } from "@mui/material";
import { LockReset } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/toastContext";
import { Input } from "@/common/components";
import { settingsService } from "../services/settingsService";

const MIN_PASSWORD_LENGTH = 6; // matches the backend rule

const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const EMPTY_FORM: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const ChangePasswordCard = () => {
  const { showSuccess, showError } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_FORM,
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const { message } = await settingsService.changePassword({
        currentPassword: data.currentPassword || undefined,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showSuccess(message || "Password updated successfully");
      reset(EMPTY_FORM);
    } catch (err) {
      showError(
        (err as { message?: string })?.message || "Failed to change password",
      );
    }
  };

  return (
    <Card elevation={0}>
      <CardHeader
        avatar={<LockReset color="primary" />}
        title="Change Password"
        subheader="Signed up with Google? Leave the current password empty to set one."
        titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
      />
      <Divider />
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            autoComplete="new-password"
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
