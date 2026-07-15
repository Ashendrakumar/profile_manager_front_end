import { Box } from "@mui/material";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, Select } from "@/common/components";
import type { FolderOption } from "../types";

interface FolderDrawerFormProps {
  open: boolean;
  title: string;
  footerActionName: string;
  onClose: () => void;
  onSubmit: () => void;
  draft: {
    name: string;
    description: string;
    parentFolderId: string;
  };
  onDraftChange: (
    field: "name" | "description" | "parentFolderId",
    value: string,
  ) => void;
  folderOptions: FolderOption[];
}

export const FolderDrawerForm = ({
  open,
  title,
  footerActionName,
  onClose,
  onSubmit,
  draft,
  onDraftChange,
  folderOptions,
}: FolderDrawerFormProps) => {
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
          label="Folder Name"
          value={draft.name}
          onChange={(event) => onDraftChange("name", event.target.value)}
          fullWidth
          required
        />
        <Select
          label="Parent Folder"
          value={draft.parentFolderId}
          onChange={(event) =>
            onDraftChange("parentFolderId", event.target.value)
          }
          options={folderOptions}
          fullWidth
        />
        <Input
          label="Description"
          value={draft.description}
          onChange={(event) => onDraftChange("description", event.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </Box>
    </SideDrawer>
  );
};
