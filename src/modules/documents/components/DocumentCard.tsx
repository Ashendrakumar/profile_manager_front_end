import { Box, Typography } from "@mui/material";
import { Description, Image, InsertDriveFile } from "@mui/icons-material";
import { EntityCard, type ActionMenuItem } from "@/common/components";
import type { DocumentItem } from "../types";

interface DocumentCardProps {
  document: DocumentItem;
  actions: ActionMenuItem[];
}

export const DocumentCard = ({ document, actions }: DocumentCardProps) => {
  const preview =
    document.fileData && document.fileType.startsWith("image/") ? (
      <img
        src={document.fileData}
        alt={document.displayName}
        style={{
          width: "100%",
          height: 140,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
    ) : (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {document.fileType.includes("pdf")
            ? "PDF preview will appear here"
            : "Document preview will appear here"}
        </Typography>
      </Box>
    );

  const avatarIcon = document.fileType.startsWith("image/") ? (
    <Image fontSize="small" />
  ) : document.fileType.includes("pdf") ? (
    <Description fontSize="small" />
  ) : (
    <InsertDriveFile fontSize="small" />
  );

  return (
    <EntityCard
      title={document.displayName}
      subtitle={document.fileName}
      avatar={avatarIcon}
      chips={[
        {
          label: new Date(document.uploadedAt).toLocaleDateString(),
          color: "default",
        },
      ]}
      avatarColor="info"
      avatarVariant="filled"
      actions={actions}
    >
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          bgcolor: "grey.50",
          p: 1,
        }}
      >
        {preview}
      </Box>
    </EntityCard>
  );
};
