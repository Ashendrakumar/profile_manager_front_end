/**
 * PersonalDetailsSection Component
 * Manages personal details (name, profile name, profile image, resume)
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Divider,
  alpha,
  Stack,
} from "@mui/material";
import {
  Save,
  Delete,
  Star,
  StarBorder,
  Download,
  Description,
  Person,
  UploadFile,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type PersonalDetails,
  type ResumeItem,
} from "../services/profileService";
import { personalDetailsSchema } from "../utils/validation";
import {
  ResumeUpload,
  ProfileImageUpload,
  Input,
  TextArea,
} from "@/common/components";
import { SkeletonLoader } from "@/common/components/SkeletonLoader";
import { useAuth } from "@/contexts";

// ── Reusable "section card" wrapper (matches Contact Details styling) ──────
const SectionCardShell = ({
  icon,
  title,
  subtitle,
  actionButton,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardHeader
      avatar={icon}
      title={
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      }
      action={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {subtitle}
            </Typography>
          )}
          {actionButton}
        </Box>
      }
      sx={{ pb: 1 }}
    />
    <Divider />
    <CardContent sx={{ pt: 2.5 }}>{children}</CardContent>
  </Card>
);

export const PersonalDetailsSection = () => {
  const { showSuccess, showError } = useToast();
  const { updateImage, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeActionId, setResumeActionId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      profileName: "",
      jobRole: "",
      profileDescription: "",
    },
  });

  useEffect(() => {
    fetchPersonalDetails();
    fetchResumes();
  }, []);

  useEffect(() => {
    if (personalDetails) {
      reset({
        firstName: personalDetails.firstName ?? "",
        lastName: personalDetails.lastName ?? "",
        profileName: personalDetails.profileName ?? "",
        jobRole: personalDetails.jobRole ?? "",
        profileDescription: personalDetails.profileDescription ?? "",
      });
    }
  }, [personalDetails, reset]);

  const fetchPersonalDetails = async () => {
    try {
      setLoading(true);
      const response = await profileService.getPersonalDetails();
      const personalDetailsData = response.personalDetails;
      setPersonalDetails(personalDetailsData);
      setResumes(personalDetailsData.resumes || []);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch personal details",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await profileService.getResumes();
      const resumeData = response.resumes;
      setResumes(resumeData || []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to fetch resumes");
    } finally {
    }
  };

  const handleProfileImageSuccess = (imagePath: string) => {
    updateImage(imagePath);
  };

  const handleResumeSuccess = (resume: ResumeItem[]) => {
    setResumes(() => [...resume]);
  };

  const handleSetPrimaryResume = async (resumeId: string) => {
    try {
      setResumeActionId(resumeId);
      const response = await profileService.setPrimaryResume(resumeId);
      setResumes(response.resumes);
      showSuccess("Primary resume updated");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update primary resume",
      );
    } finally {
      setResumeActionId(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      setResumeActionId(resumeId);
      const response = await profileService.deleteResume(resumeId);
      setResumes(response.resumes);
      showSuccess("Resume deleted");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete resume");
    } finally {
      setResumeActionId(null);
    }
  };

  const onSubmit = async (data: PersonalDetails) => {
    try {
      setSaving(true);
      const response = await profileService.updatePersonalDetails(data);
      setPersonalDetails(response.personalDetails);
      // Keep the resume list in sync if the save response carries it, so the
      // two state sources don't diverge.
      if (response.personalDetails.resumes) {
        setResumes(response.personalDetails.resumes);
      }
      reset(data); // resets isDirty baseline to the just-saved values
      showSuccess("Personal details updated successfully");
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update personal details",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Personal Details
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your personal information including name, profile picture, and
          resume
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SkeletonLoader variant="detail" lines={5} />
          </Grid>
          <Grid item xs={12} md={8}>
            <SkeletonLoader variant="detail" lines={5} />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={1.5}>
          <Grid item xs={12} md={6}>
            <SkeletonLoader variant="detail" lines={5} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SkeletonLoader variant="detail" lines={5} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Personal Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your personal information including name, profile picture, and
        resume
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Profile Image Section */}
          <Grid item xs={12} md={4}>
            <SectionCardShell
              icon={<Person color="primary" />}
              title="Profile Picture"
            >
              <ProfileImageUpload
                onSuccess={handleProfileImageSuccess}
                initialImage={user?.avatarUrl}
                label={
                  user?.avatarUrl
                    ? "Change Profile Picture"
                    : "Upload Profile Picture"
                }
                initialFileName={
                  user?.avatarUrl ? personalDetails?.firstName : ""
                }
                showPreview={true}
              />
            </SectionCardShell>
          </Grid>

          {/* Name Fields Section */}
          <Grid item xs={12} md={8}>
            <SectionCardShell
              icon={<Person color="primary" />}
              title="Basic Information"
              actionButton={
                <Button
                  size="small"
                  type="submit"
                  variant="contained"
                  disabled={saving || !isDirty}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              }
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Input
                    label="First Name"
                    name="firstName"
                    placeholder="Enter your first name"
                    register={register}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Input
                    label="Last Name"
                    name="lastName"
                    placeholder="Enter your last name"
                    register={register}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Input
                    label="Profile Name"
                    name="profileName"
                    placeholder="Enter your profile name (for display)"
                    register={register}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Input
                    label="Job Role"
                    name="jobRole"
                    placeholder="Enter your job role (for display)"
                    register={register}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextArea
                    label="Profile Description"
                    name="profileDescription"
                    placeholder="Enter a brief description about yourself (max 160 characters)"
                    rows={4}
                    register={register}
                    errors={errors}
                  />
                </Grid>
              </Grid>
            </SectionCardShell>
          </Grid>

          {/* Resume Section */}
          <Grid item xs={12} md={6}>
            <SectionCardShell
              icon={<UploadFile color="primary" />}
              title="Upload Resume"
            >
              <ResumeUpload
                onUploaded={setResumes}
                onSuccess={handleResumeSuccess}
              />
            </SectionCardShell>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCardShell
              icon={<Description color="primary" />}
              title="Your Resumes"
              subtitle={
                resumes?.length
                  ? `${resumes.length} file${resumes.length > 1 ? "s" : ""} uploaded`
                  : "No resumes uploaded yet"
              }
            >
              {resumes?.length > 0 ? (
                <Stack spacing={1.5}>
                  {resumes.map((resume) => {
                    const busy = resumeActionId === resume._id;
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
                          borderColor: resume.isPrimary
                            ? "primary.main"
                            : "divider",
                          bgcolor: resume.isPrimary
                            ? (theme) => alpha(theme.palette.primary.main, 0.04)
                            : "transparent",
                          transition:
                            "border-color 0.2s ease, background-color 0.2s ease",
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: resume.isPrimary
                              ? "primary.main"
                              : (theme) =>
                                  alpha(theme.palette.text.secondary, 0.08),
                          }}
                        >
                          <Description
                            fontSize="small"
                            sx={{
                              color: resume.isPrimary
                                ? "common.white"
                                : "text.secondary",
                            }}
                          />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight: 500,
                                maxWidth: { xs: 130, sm: 180 },
                              }}
                            >
                              {resume.fileName}
                            </Typography>
                            {resume.isPrimary && (
                              <Chip
                                label="Primary"
                                size="small"
                                color="primary"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Stack>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={0.25}
                          sx={{ flexShrink: 0 }}
                        >
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
                          <Tooltip
                            title={
                              resume.isPrimary
                                ? "Primary resume"
                                : "Set as primary"
                            }
                          >
                            {/* span keeps Tooltip working while the button is disabled */}
                            <span>
                              <IconButton
                                size="small"
                                color={resume.isPrimary ? "warning" : "default"}
                                disabled={busy || resume.isPrimary}
                                onClick={() =>
                                  handleSetPrimaryResume(resume._id)
                                }
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
                                onClick={() => handleDeleteResume(resume._id)}
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
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    py: 4,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: (theme) =>
                        alpha(theme.palette.text.secondary, 0.08),
                    }}
                  >
                    <Description sx={{ color: "text.secondary" }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    No resumes uploaded yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Upload one on the left to see it listed here
                  </Typography>
                </Box>
              )}
            </SectionCardShell>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
