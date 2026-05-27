/**
 * PersonalDetailsSection Component
 * Manages personal details (name, profile name, profile image, resume)
 */

import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Grid, Stack } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type PersonalDetails,
} from "../services/profileService";
import { personalDetailsSchema } from "../utils/validation";
import {
  LoadingSpinner,
  ResumeUpload,
  ProfileImageUpload,
} from "@/common/components";

type PersonalDetailsFormData = {
  firstName: string;
  lastName: string;
  profileName: string;
  jobRole: string;
  profileDescription: string;
};

export const PersonalDetailsSection = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalDetailsFormData>({
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
  }, []);

  const fetchPersonalDetails = async () => {
    try {
      setLoading(true);
      const response = await profileService.getPersonalDetails();
      const personalDetailsData = response.personalDetails;
      setPersonalDetails(personalDetailsData);
      reset({
        firstName: personalDetailsData.firstName || "",
        lastName: personalDetailsData.lastName || "",
        profileName: personalDetailsData.profileName || "",
        jobRole: personalDetailsData.jobRole || "",
        profileDescription: personalDetailsData.profileDescription || "",
        // resume: personalDetailsData.resume || "",
        // profileImage: personalDetailsData.profileImage || "",
      });
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch personal details",
      );
    } finally {
      setLoading(false);
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

  const onSubmit = async (data: PersonalDetailsFormData) => {
    try {
      setSaving(true);
      const response = await profileService.updatePersonalDetails(data);
      setPersonalDetails(response.personalDetails);
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
    return <LoadingSpinner />;
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Profile Image Section */}
          <Grid item sm={12} md={4}>
            <ProfileImageUpload
              onSuccess={handleProfileImageSuccess}
              initialImage={personalDetails?.profileImage}
              label="Upload Profile Picture"
              showPreview={true}
            />
          </Grid>

          {/* Name Fields Section */}
          <Grid item sm={12} md={8}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    placeholder="Enter your first name"
                    {...register("firstName")}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    placeholder="Enter your last name"
                    {...register("lastName")}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="Profile Name"
                    placeholder="Enter your profile name (for display)"
                    {...register("profileName")}
                    error={!!errors.profileName}
                    helperText={errors.profileName?.message}
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Role"
                    placeholder="Enter your job role (for display)"
                    {...register("jobRole")}
                    error={!!errors.jobRole}
                    helperText={errors.jobRole?.message}
                  />
                </Grid>
                <Grid item sm={12}>
                  <TextField
                    fullWidth
                    label="Profile Description"
                    placeholder="Enter a brief description about yourself (max 160 characters)"
                    multiline
                    rows={4}
                    {...register("profileDescription")}
                    error={!!errors.profileDescription}
                    helperText={errors.profileDescription?.message}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Resume Section */}
          <Grid item sm={12} md={6}>
            <ResumeUpload />
          </Grid>

          <Grid item sm={12} md={6}>
            {/* <ResumeUpload /> */}
          </Grid>

          {/* Submit Button */}
          <Grid item sm={12}>
            <Button
              size="medium"
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={<Edit />}
            >
              {saving ? "Saving..." : "Save Personal Details"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
