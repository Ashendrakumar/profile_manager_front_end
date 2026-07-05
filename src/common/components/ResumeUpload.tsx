/**
 * ResumeUpload Component
 * Reusable resume file upload component
 */

import {
  Box,
  Button,
  CircularProgress,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
  useEffect,
} from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  profileService,
  type ResumeItem,
} from "@/modules/profile/services/profileService";
import { toastService } from "@/contexts";

export interface ResumeUploadProps {
  onSuccess?: (fileName: string) => void;
  /** Called after a successful upload with the user's full, updated resume list. */
  onUploaded?: (resumes: ResumeItem[]) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in MB
  accept?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const DEFAULT_MAX_SIZE = 5; // MB

export const ResumeUpload = ({
  onSuccess,
  onUploaded,
  onError,
  maxFileSize = DEFAULT_MAX_SIZE,
  accept = ".pdf,.doc,.docx",
  disabled = false,
  label = "Drag & drop your resume here",
  helperText = `PDF, DOC or DOCX · Max ${DEFAULT_MAX_SIZE}MB`,
}: ResumeUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

  const validateFile = (file: File): boolean => {
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!hasValidMime && !hasValidExt) {
      setError("Invalid file format. Please upload PDF, DOC, or DOCX file");
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    if (!validateFile(file)) {
      if (onError) onError("File validation failed");
      return;
    }

    try {
      setLoading(true);
      setFileName(file.name);

      const result = await profileService.uploadResume(file, (percent) =>
        setUploadProgress(percent),
      );

      setUploadProgress(100);
      setSuccess(true);
      setLoading(false);

      if (onSuccess) onSuccess(file.name);
      if (onUploaded) onUploaded(result.resumes);

      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
        setFileName("");
      }, 3000);
    } catch (err) {
      setLoading(false);
      setUploadProgress(0);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    e.currentTarget.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClickUpload = () => {
    if (disabled || loading) return;
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (success) {
      toastService.success("Resume uploaded successfully");
    }
    if (error) {
      toastService.error(error);
    }
  }, [success, error]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const statusColor = success
    ? "success.main"
    : error
      ? "error.main"
      : "divider";

  return (
    <Box width="100%">
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        sx={{
          p: 2.5,
          borderRadius: 2,
          textAlign: "center",
          border: "1.5px dashed",
          borderColor: isDragOver ? "primary.main" : statusColor,
          backgroundColor: isDragOver ? "action.hover" : "transparent",
          transition: "all 0.2s ease",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          "&:hover": disabled
            ? undefined
            : {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled || loading}
          style={{ display: "none" }}
        />

        <Stack spacing={1.25} alignItems="center">
          {!loading && !success && !error && (
            <CloudUploadIcon sx={{ fontSize: 36, color: "primary.main" }} />
          )}
          {loading && <CircularProgress size={36} />}
          {!loading && success && (
            <CheckCircleIcon sx={{ fontSize: 36, color: "success.main" }} />
          )}
          {!loading && error && (
            <ErrorIcon sx={{ fontSize: 36, color: "error.main" }} />
          )}

          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {success ? "Resume uploaded" : error ? "Upload failed" : label}
          </Typography>

          {!loading && !success && !error && (
            <Typography variant="caption" color="text.secondary">
              {helperText}
            </Typography>
          )}

          {error && (
            <Typography variant="caption" color="error.main">
              {error}
            </Typography>
          )}

          {fileName && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ color: "text.secondary" }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" noWrap sx={{ maxWidth: 220 }}>
                {fileName}
              </Typography>
            </Stack>
          )}

          {!loading && !success && (
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClickUpload();
              }}
              disabled={disabled}
            >
              Choose File
            </Button>
          )}

          {loading && uploadProgress > 0 && (
            <Box sx={{ width: "100%", maxWidth: 260 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Uploading… {uploadProgress}%
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
