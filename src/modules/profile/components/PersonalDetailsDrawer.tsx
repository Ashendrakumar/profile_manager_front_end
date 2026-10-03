/**
 * PersonalDetailsDrawer
 * Edit form for the personal-info fields (+ profile photo), hosted in the
 * shared SideDrawer. Reuses `personalDetailsSchema`, the Input/TextArea
 * primitives and ProfileImageUpload. Save is wired to the drawer footer.
 */

import { useEffect, useState } from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid, Divider, Typography } from "@mui/material";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, TextArea, ProfileImageUpload } from "@/common/components";
import { useToast } from "@/contexts/toastContext";
import { useAuth } from "@/contexts";
import { profileService, type PersonalDetails } from "../services/profileService";
import { personalDetailsSchema } from "../utils/validation";

type FormData = z.infer<typeof personalDetailsSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  personalDetails: PersonalDetails | null;
  onSaved: (updated: PersonalDetails) => void;
}

export const PersonalDetailsDrawer = ({
  open,
  onClose,
  personalDetails,
  onSaved,
}: Props) => {
  const { showSuccess, showError } = useToast();
  const { user, updateImage } = useAuth();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      profileName: "",
      jobRole: "",
      profileDescription: "",
    },
  });

  // Seed the form each time the drawer opens with fresh data.
  useEffect(() => {
    if (open && personalDetails) {
      reset({
        firstName: personalDetails.firstName ?? "",
        lastName: personalDetails.lastName ?? "",
        profileName: personalDetails.profileName ?? "",
        jobRole: personalDetails.jobRole ?? "",
        profileDescription: personalDetails.profileDescription ?? "",
      });
    }
  }, [open, personalDetails, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const res = await profileService.updatePersonalDetails(data);
      showSuccess("Personal details updated");
      onSaved(res.personalDetails);
      onClose();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update personal details",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      loading={saving}
      title="Edit Personal Details"
      subTitle="Update your identity & photo"
      footerActionName={saving ? "Saving…" : "Save changes"}
      footerActionClick={handleSubmit(onSubmit)}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <ProfileImageUpload
          onSuccess={(img) => updateImage(img)}
          initialImage={user?.avatarUrl}
          initialFileName={personalDetails?.firstName}
          label={user?.avatarUrl ? "Change photo" : "Upload photo"}
          showPreview
        />

        <Divider sx={{ my: 2.5 }} />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Basic information
        </Typography>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <Input label="First Name" name="firstName" register={register} errors={errors} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input label="Last Name" name="lastName" register={register} errors={errors} required />
          </Grid>
          <Grid item xs={12}>
            <Input label="Profile Name" name="profileName" register={register} errors={errors} required />
          </Grid>
          <Grid item xs={12}>
            <Input label="Job Role" name="jobRole" register={register} errors={errors} required />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              label="Profile Description"
              name="profileDescription"
              placeholder="A short summary about yourself (max 160 characters)"
              rows={4}
              register={register}
              errors={errors}
            />
          </Grid>
        </Grid>
      </Box>
    </SideDrawer>
  );
};
