import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, Select } from "@/common/components";
import type { FolderOption } from "../types";

interface DocumentDrawerFormProps {
  open: boolean;
  title: string;
  footerActionName: string;
  onClose: () => void;
  onSubmit: () => void;
  draft: {
    displayName: string;
    file: File | null;
    folderId: string;
  };
  onDraftChange: (
    field: "displayName" | "file" | "folderId",
    value: string | File | null,
  ) => void;
  folderOptions: FolderOption[];
  loading?: boolean;
  /** Upload progress (0-100) while a file is being sent. */
  progress?: number;
}

// Mirrors the backend's "files" upload rule (src/middlewares/upload.js).
const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif";

export const DocumentDrawerForm = ({
  open,
  title,
  footerActionName,
  onClose,
  onSubmit,
  draft,
  onDraftChange,
  folderOptions,
  loading = false,
  progress,
}: DocumentDrawerFormProps) => {
  return (
    <SideDrawer
      open={open}
      onClose={loading ? undefined : onClose}
      loading={loading}
      title={title}
      footerActionClick={onSubmit}
      footerActionName={footerActionName}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Input
          label="Display Name"
          value={draft.displayName}
          onChange={(event) => onDraftChange("displayName", event.target.value)}
          fullWidth
          required
        />

        <Select
          label="Folder"
          value={draft.folderId}
          onChange={(event) => onDraftChange("folderId", event.target.value)}
          options={folderOptions}
          fullWidth
        />

        <TextField
          label="Choose File"
          type="file"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputProps: { accept: ACCEPTED_FILE_TYPES },
            startAdornment: (
              <InputAdornment position="start">
                <UploadFile />
              </InputAdornment>
            ),
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            onDraftChange("file", target.files?.[0] ?? null);
          }}
          helperText="PDF, Office, text or image files up to 5MB"
          disabled={loading}
        />

        {draft.file ? (
          <Typography variant="body2" color="text.secondary">
            Selected: {draft.file.name}
          </Typography>
        ) : null}

        {loading && typeof progress === "number" ? (
          <Box>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary">
              Uploading… {progress}%
            </Typography>
          </Box>
        ) : null}
      </Box>
    </SideDrawer>
  );
};
