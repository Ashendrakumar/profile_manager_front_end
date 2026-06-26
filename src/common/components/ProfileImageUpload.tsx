import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Person } from "@mui/icons-material";
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

  // FIX: Use state for drag-over so hover styles actually re-render
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track the "success" auto-reset timer so we can clear it on unmount.
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

      // FIX: Resolve the preview URL before the upload call so onSuccess
      // receives the real data-URL, not a potentially-null snapshot.
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setImagePreview(previewUrl);

      // Real upload progress (the service forwards axios onUploadProgress).
      const res = await profileService.uploadProfileImage(file, (percent) =>
        setUploadProgress(percent),
      );

      setUploadProgress(100);
      setSuccess(true);
      setLoading(false);

      // Prefer the persisted server URL; fall back to the local preview.
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
    // Reset input value so the same file can be re-selected after an error
    e.currentTarget.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
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
    fileInputRef.current?.click();
  };

  // Sync preview when the saved image arrives (e.g. after the parent's async
  // fetch resolves). Without this the initially-saved image never shows,
  // because initialImage is only read into state on first mount.
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
    }
    if (initialFileName) {
      setFileName(initialFileName);
    }
  }, [initialImage, initialFileName]);

  // Clear the success auto-reset timer on unmount.
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (success) toastService.success("Profile image uploaded successfully");
    if (error) toastService.error(error);
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
          // FIX: isDragOver is now state — MUI will re-render with correct color
          borderColor: isDragOver ? "primary.main" : "divider",
          backgroundColor: isDragOver ? "action.hover" : "background.paper",
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

          <Typography variant="h6" component="div">
            {label}
          </Typography>

          {!loading && !success && (
            <Typography variant="body2" color="textSecondary">
              {helperText}
            </Typography>
          )}

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

          {loading && uploadProgress > 0 && (
            <Box sx={{ width: "100%", maxWidth: 300 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="textSecondary">
                {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Show selected file name when not loading */}
          {!loading && fileName !== "No image selected" && (
            <Typography variant="caption" color="textSecondary">
              {fileName}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
