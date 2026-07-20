/**
 * ProfileImageUpload Component
 */

import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Person, CameraAlt, CheckCircle } from "@mui/icons-material";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { profileService } from "@/modules/profile";
import { toastService } from "@/contexts";

const DEFAULT_MAX_SIZE = 5; // MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export interface ProfileImageUploadProps {
  onSuccess?: (imageUrl: string, fileName: string) => void;
  onError?: (message: string) => void;
  initialImage?: string;
  initialFileName?: string;
  maxFileSize?: number;
  accept?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  showPreview?: boolean;
}

export const ProfileImageUpload = ({
  onSuccess,
  onError,
  initialImage,
  initialFileName,
  maxFileSize = DEFAULT_MAX_SIZE,
  accept = "image/*",
  disabled = false,
  label = "Profile Picture",
  helperText = `JPG, PNG, GIF or WebP · Max ${DEFAULT_MAX_SIZE}MB`,
  showPreview = true,
}: ProfileImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>(
    initialFileName || "No image selected",
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    () => initialImage || null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateFile = (file: File): boolean => {
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Invalid file format. Please upload JPG, PNG, GIF, or WebP");
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

      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setImagePreview(previewUrl);

      const res = await profileService.uploadProfileImage(file, (percent) =>
        setUploadProgress(percent),
      );

      setUploadProgress(100);
      setSuccess(true);
      setLoading(false);

      if (onSuccess) onSuccess(res.profileImage || previewUrl, file.name);

      successTimeoutRef.current = setTimeout(() => setSuccess(false), 3000);
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
    if (disabled || loading) return;
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || loading) return;
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
    if (initialImage) {
      setImagePreview(initialImage);
    }
    if (initialFileName) {
      setFileName(initialFileName);
    }
  }, [initialImage, initialFileName]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (success) toastService.success("Profile image uploaded successfully");
    if (error) toastService.error(error);
  }, [success, error]);

  const hasSelection = imagePreview !== "No image selected";
  const statusColor = success
    ? "success.main"
    : error
      ? "error.main"
      : "divider";

  return (
    <Box width="100%">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        disabled={disabled || loading}
        style={{ display: "none" }}
      />

      {/* Whole card is the dropzone, matching ResumeUpload's pattern */}
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
        <Stack spacing={1.5} alignItems="center">
          {showPreview && (
            <Box sx={{ position: "relative" }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  !loading && !disabled ? (
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid",
                        borderColor: "background.paper",
                      }}
                    >
                      <CameraAlt sx={{ fontSize: 15, color: "common.white" }} />
                    </Box>
                  ) : null
                }
              >
                <Avatar
                  src={imagePreview || ""}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: "2.25rem",
                    bgcolor: "primary.main",
                    borderWidth: 3,
                    borderStyle: "solid",
                    borderColor: success
                      ? "success.main"
                      : error
                        ? "error.main"
                        : "background.paper",
                    boxShadow: 1,
                  }}
                >
                  {!imagePreview && (
                    <Person sx={{ fontSize: 40, color: "common.white" }} />
                  )}
                </Avatar>
              </Badge>

              {loading && (
                <CircularProgress
                  size={116}
                  thickness={2}
                  sx={{
                    position: "absolute",
                    top: -3,
                    left: -3,
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          )}

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {success ? "Photo uploaded" : error ? "Upload failed" : label}
            </Typography>
            {!loading && !success && !error && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
            {!loading && error && (
              <Typography variant="caption" color="error.main">
                {error}
              </Typography>
            )}
          </Box>

          {!loading && hasSelection && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: 220 }}
            >
              {fileName}
            </Typography>
          )}

          {loading && uploadProgress > 0 && (
            <Box sx={{ width: "100%", maxWidth: 220 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", mt: 0.5 }}
              >
                Uploading… {uploadProgress}%
              </Typography>
            </Box>
          )}

          {!loading && (
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClickUpload();
              }}
              disabled={disabled}
            >
              {hasSelection ? "Change Photo" : "Choose Photo"}
            </Button>
          )}

          {!loading && success && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              <Typography variant="caption" color="success.main">
                Uploaded
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
