/**
 * ProfileImageUpload Component
 * Reusable profile image upload component with preview
 */

import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  Avatar,
} from "@mui/material";
import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
  useEffect,
} from "react";
import { toastService } from "@/contexts";
import { profileService } from "@/modules/profile";
import { Person } from "@mui/icons-material";

export interface ProfileImageUploadProps {
  onSuccess?: (imagePath: string, fileName: string) => void;
  onError?: (error: string) => void;
  initialImage?: string; // Initial image URL or path
  initialFileName?: string; // Initial file name for display
  maxFileSize?: number; // in MB
  accept?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  showPreview?: boolean;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const DEFAULT_MAX_SIZE = 5; // MB

/**
 * Profile Image Upload Component
 * Handles image file upload with drag-and-drop support and preview
 */
export const ProfileImageUpload = ({
  onSuccess,
  onError,
  initialImage,
  initialFileName,
  maxFileSize = DEFAULT_MAX_SIZE,
  accept = "image/*",
  disabled = false,
  label = "Upload Profile Picture",
  helperText = `Supported formats: JPG, PNG, GIF, WebP (Max ${DEFAULT_MAX_SIZE}MB)`,
  showPreview = true,
}: ProfileImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>(
    initialFileName || "No image selected",
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null,
  );
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
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Invalid file format. Please upload JPG, PNG, GIF, or WebP");
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    console.log(fileName);
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      await profileService.uploadProfileImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setLoading(false);

      if (onSuccess) onSuccess(imagePreview || "", file.name);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
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
      toastService.success("Profile image uploaded successfully");
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
          {/* Image Preview */}
          {showPreview && (
            <Avatar
              src={imagePreview || ""}
              sx={{
                width: 120,
                height: 120,
                fontSize: "2.5rem",
                bgcolor: "primary.main",
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: success
                  ? "success.main"
                  : error
                    ? "error.main"
                    : "common.white",
              }}
            >
              {!imagePreview && (
                <Person sx={{ fontSize: 48, color: "common.white" }} />
              )}
            </Avatar>
          )}

          {loading && <CircularProgress />}

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

          {/* Upload Button */}
          {!loading && !success && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickUpload}
              disabled={disabled}
            >
              Choose Image
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
