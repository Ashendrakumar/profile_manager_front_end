/**
 * ResumeManagerDrawer
 * Manage multiple resumes in the shared SideDrawer: upload (ResumeUpload),
 * set-primary and delete. Actions are immediate (no footer Save) — each call
 * returns the updated list, which is pushed up via `onChange`.
 */

import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Description,
  Download,
  Star,
  StarBorder,
  Delete,
} from "@mui/icons-material";
import { SideDrawer } from "@/common/components/SideDrawer";
import { ResumeUpload } from "@/common/components";
import { useToast } from "@/contexts/toastContext";
import { profileService, type ResumeItem } from "../services/profileService";

interface Props {
  open: boolean;
  onClose: () => void;
  resumes: ResumeItem[];
  onChange: (resumes: ResumeItem[]) => void;
}

export const ResumeManagerDrawer = ({ open, onClose, resumes, onChange }: Props) => {
  const { showSuccess, showError } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleSetPrimary = async (id: string) => {
    try {
      setBusyId(id);
      const res = await profileService.setPrimaryResume(id);
      onChange(res.resumes);
      showSuccess("Primary resume updated");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update primary resume");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBusyId(id);
      const res = await profileService.deleteResume(id);
      onChange(res.resumes);
      showSuccess("Resume deleted");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete resume");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Manage resumes"
      subTitle="Add, set primary or remove"
    >
      <ResumeUpload onSuccess={onChange} onUploaded={onChange} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          display: "block",
          mt: 3,
          mb: 1.5,
        }}
      >
        Your resumes ({resumes.length})
      </Typography>

      {resumes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          No resumes yet — upload one above.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {resumes.map((resume) => {
            const busy = busyId === resume._id;
            return (
              <Box
                key={resume._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: resume.isPrimary ? "primary.main" : "divider",
                  bgcolor: resume.isPrimary
                    ? (t) => alpha(t.palette.primary.main, 0.06)
                    : "transparent",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: resume.isPrimary
                      ? "primary.main"
                      : (t) => alpha(t.palette.text.secondary, 0.08),
                  }}
                >
                  <Description
                    fontSize="small"
                    sx={{ color: resume.isPrimary ? "common.white" : "text.secondary" }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500, maxWidth: 150 }}>
                      {resume.fileName}
                    </Typography>
                    {resume.isPrimary && (
                      <Chip label="Primary" size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      component="a"
                      href={resume.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={resume.isPrimary ? "Primary resume" : "Set as primary"}>
                    <span>
                      <IconButton
                        size="small"
                        color={resume.isPrimary ? "warning" : "default"}
                        disabled={busy || resume.isPrimary}
                        onClick={() => handleSetPrimary(resume._id)}
                      >
                        {busy ? (
                          <CircularProgress size={16} />
                        ) : resume.isPrimary ? (
                          <Star fontSize="small" />
                        ) : (
                          <StarBorder fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={busy}
                        onClick={() => handleDelete(resume._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </SideDrawer>
  );
};
