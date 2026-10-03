import { Box, Link, Typography } from "@mui/material";
import {
  Description,
  Image,
  InsertDriveFile,
  OpenInNew,
} from "@mui/icons-material";
import {
  EntityCard,
  type ActionMenuItem,
  type EntityCardChip,
} from "@/common/components";
import type { DocumentItem } from "../types";

interface DocumentCardProps {
  document: DocumentItem;
  actions: ActionMenuItem[];
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentCard = ({ document, actions }: DocumentCardProps) => {
  const isImage = document.fileType.startsWith("image/");
  const isPdf = document.fileType.includes("pdf");

  const preview =
    document.fileUrl && isImage ? (
      <img
        src={document.fileUrl}
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
        {isPdf ? (
          <Description color="action" sx={{ fontSize: 40 }} />
        ) : (
          <InsertDriveFile color="action" sx={{ fontSize: 40 }} />
        )}
        {document.fileUrl ? (
          <Link
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
          >
            Open file <OpenInNew sx={{ fontSize: 16 }} />
          </Link>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Preview unavailable
          </Typography>
        )}
      </Box>
    );

  const avatarIcon = isImage ? (
    <Image fontSize="small" />
  ) : isPdf ? (
    <Description fontSize="small" />
  ) : (
    <InsertDriveFile fontSize="small" />
  );

  const chips: EntityCardChip[] = [
    {
      label: new Date(document.uploadedAt).toLocaleDateString(),
      color: "default",
    },
  ];
  const size = formatFileSize(document.fileSize);
  if (size) chips.push({ label: size, color: "default" });

  return (
    <EntityCard
      title={document.displayName}
      subtitle={document.fileName}
      avatar={avatarIcon}
      chips={chips}
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
          bgcolor: "action.hover",
          p: 1,
        }}
      >
        {preview}
      </Box>
    </EntityCard>
  );
};
