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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Star,
  StarBorder,
  Download,
  Description,
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

export const PersonalDetailsSection = ({ userId }: { userId?: string }) => {
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeActionId, setResumeActionId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    fetchPersonalDetails(userId);
  }, [userId]);

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

  const fetchPersonalDetails = async (id?: string) => {
    try {
      // setLoading(true);
      const response = await profileService.getPersonalDetails(id);
      const personalDetailsData = response.personalDetails;
      setPersonalDetails(personalDetailsData);
      setResumes(personalDetailsData.resumes || []);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch personal details",
      );
    } finally {
      // setLoading(false);
    }
  };

  const handleProfileImageSuccess = (imagePath: string) => {
    setPersonalDetails((prev) =>
      prev
        ? {
            ...prev,
            profileImage: imagePath,
          }
        : null,
    );
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Personal Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your personal information including name, profile picture, and
        resume
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Profile Image Section */}
          <Grid item xs={12} md={4}>
            <ProfileImageUpload
              onSuccess={handleProfileImageSuccess}
              initialImage={personalDetails?.profileImage}
              label="Upload Profile Picture"
              showPreview={true}
            />
          </Grid>

          {/* Name Fields Section */}
          <Grid item xs={12} md={8}>
            <Grid
              container
              spacing={2}
              alignItems="stretch"
              justifyContent="center"
              sx={{ height: "100%", width: "100%" }}
            >
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
              <Grid item xs={12} md={12}>
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
          </Grid>

          {/* Resume Section */}
          <Grid item xs={12} md={6}>
            <ResumeUpload onUploaded={setResumes} />
          </Grid>

          <Grid item xs={12} md={6}>
            {resumes?.length > 0 && (
              <Paper variant="outlined">
                <Typography variant="subtitle2" sx={{ px: 2, pt: 2 }}>
                  Your Resumes ({resumes?.length})
                </Typography>
                <List dense>
                  {resumes.map((resume) => {
                    const busy = resumeActionId === resume._id;
                    return (
                      <ListItem
                        key={resume._id}
                        secondaryAction={
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="Download">
                              <IconButton
                                edge="end"
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
                                  edge="end"
                                  size="small"
                                  color={
                                    resume.isPrimary ? "warning" : "default"
                                  }
                                  disabled={busy || resume.isPrimary}
                                  onClick={() =>
                                    handleSetPrimaryResume(resume._id)
                                  }
                                >
                                  {resume.isPrimary ? (
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
                                  edge="end"
                                  size="small"
                                  color="error"
                                  disabled={busy}
                                  onClick={() => handleDeleteResume(resume._id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Description fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={resume.fileName}
                          secondary={
                            resume.isPrimary ? (
                              <Chip
                                label="Primary"
                                size="small"
                                color="primary"
                                sx={{ height: 18, fontSize: "0.65rem" }}
                              />
                            ) : null
                          }
                          primaryTypographyProps={{
                            noWrap: true,
                            sx: { maxWidth: { xs: 140, sm: 220 } },
                          }}
                          secondaryTypographyProps={{
                            component: "div",
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={!saving ? <Edit /> : <CircularProgress size={20} />}
            >
              {saving ? "Saving..." : "Save Personal Details"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
