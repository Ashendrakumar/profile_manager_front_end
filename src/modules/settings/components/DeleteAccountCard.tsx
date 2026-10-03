/**
 * DeleteAccountCard
 * Danger zone: permanently delete the account and all of its data.
 */

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { DeleteForever, WarningAmber } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { Input } from "@/common/components";
import { authService } from "@/modules/auth/services/authService";
import { ROUTES } from "@/constants";
import { settingsService } from "../services/settingsService";

const CONFIRM_TEXT = "DELETE";

export const DeleteAccountCard = () => {
  const { showSuccess, showError } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const closeDialog = () => {
    if (deleting) return;
    setOpen(false);
    setPassword("");
    setConfirmText("");
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      // The backend checks the password for password accounts and the
      // confirmation text for Google-only accounts.
      await settingsService.deleteAccount({
        password: password || undefined,
        confirmText,
      });
      showSuccess("Your account has been deleted");
      authService.clearAuth();
      // Full reload so every in-memory user/session state is dropped.
      window.location.replace(ROUTES.LOGIN);
    } catch (err) {
      showError(
        (err as { message?: string })?.message || "Failed to delete account",
      );
      setDeleting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{ borderColor: "error.main", borderWidth: 1, borderStyle: "solid" }}
    >
      <CardHeader
        avatar={<WarningAmber color="error" />}
        title="Danger Zone"
        titleTypographyProps={{
          variant: "subtitle1",
          fontWeight: 600,
          color: "error",
        }}
      />
      <Divider />
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            Permanently delete your account, profile, portfolio, documents and
            settings. This cannot be undone.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            Delete Account
          </Button>
        </Stack>
      </CardContent>

      <Dialog open={open} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            All of your data will be permanently removed.
          </Alert>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your password (leave empty if you only sign in with Google)
            and type <strong>{CONFIRM_TEXT}</strong> to confirm.
          </DialogContentText>
          <Stack spacing={2}>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={deleting}
              autoComplete="current-password"
            />
            <Input
              label={`Type ${CONFIRM_TEXT} to confirm`}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              disabled={deleting}
              placeholder={CONFIRM_TEXT}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting || confirmText !== CONFIRM_TEXT}
            startIcon={
              deleting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
