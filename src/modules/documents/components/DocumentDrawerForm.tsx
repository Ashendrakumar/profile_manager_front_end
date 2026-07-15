import { Box, InputAdornment, TextField, Typography } from "@mui/material";
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
}

export const DocumentDrawerForm = ({
  open,
  title,
  footerActionName,
  onClose,
  onSubmit,
  draft,
  onDraftChange,
  folderOptions,
}: DocumentDrawerFormProps) => {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
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
            inputProps: { accept: "*/*" },
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
        />

        {draft.file ? (
          <Typography variant="body2" color="text.secondary">
            Selected: {draft.file.name}
          </Typography>
        ) : null}
      </Box>
    </SideDrawer>
  );
};
