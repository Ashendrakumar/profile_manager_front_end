/**
 * ResumeUpload Component
 * Reusable resume file upload component
 */

import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
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
import { profileService } from "@/modules/profile/services/profileService";
import { toastService } from "@/contexts";

export interface ResumeUploadProps {
  onSuccess?: (fileName: string) => void;
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

/**
 * Resume Upload Component
 * Handles file upload with drag-and-drop support
 */
export const ResumeUpload = ({
  onSuccess,
  onError,
  maxFileSize = DEFAULT_MAX_SIZE,
  accept = ".pdf,.doc,.docx",
  disabled = false,
  label = "Upload Resume",
  helperText = `Supported formats: PDF, DOC, DOCX (Max ${DEFAULT_MAX_SIZE}MB)`,
}: ResumeUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Invalid file format. Please upload PDF, DOC, or DOCX file");
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    // Reset states
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      // Call profile service to upload resume
      await profileService.uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setLoading(false);

      if (onSuccess) onSuccess(file.name);

      // Reset success message after 3 seconds
      setTimeout(() => {
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
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClickUpload = () => {
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

  return (
    <Box width="100%">
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragOverRef.current ? "primary.main" : "divider",
          backgroundColor: dragOverRef.current
            ? "action.hover"
            : "background.paper",
          transition: "all 0.3s ease",
          cursor: "pointer",
          "&:hover": {
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

        <Stack spacing={2} alignItems="center">
          {/* Icon */}
          {!loading && !success && !error && (
            <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
          )}
          {loading && <CircularProgress />}
          {success && (
            <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
          )}
          {error && <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />}

          {/* Label */}
          <Typography variant="h6" component="div">
            {label}
          </Typography>

          {/* Helper Text */}
          {!loading && !success && (
            <Typography variant="body2" color="textSecondary">
              {helperText}
            </Typography>
          )}

          {/* File Name */}
          {fileName && (
            <Typography variant="body2" color="textSecondary">
              File: {fileName}
            </Typography>
          )}

          {/* Upload Button */}
          {!loading && !success && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickUpload}
              disabled={disabled}
            >
              Choose File
            </Button>
          )}

          {/* Progress */}
          {loading && uploadProgress > 0 && (
            <Box sx={{ width: "100%", maxWidth: 300 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="textSecondary">
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
