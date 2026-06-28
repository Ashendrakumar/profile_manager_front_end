/**
 * ContactDetailsSection Component
 * Manages contact details (email, phones, addresses, social links)
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Add, Delete, Save } from "@mui/icons-material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type ContactDetails,
} from "../services/profileService";
import { contactDetailsSchema } from "../utils/validation";

type ContactDetailsFormData = {
  email: string;
  phones: { number: string; type: "mobile" | "home" | "work" }[];
  addresses: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    type: "home" | "work";
  }[];
  socialLinks: {
    platform: "linkedin" | "github" | "twitter" | "portfolio";
    url: string;
  }[];
};

export const ContactDetailsSection = () => {
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(
    null,
  );
  console.log(contactDetails);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email: "",
      phones: [{ number: "", type: "mobile" }],
      addresses: [{ street: "", city: "", country: "", type: "home" }],
      socialLinks: [{ platform: "linkedin", url: "" }],
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phones",
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const {
    fields: socialLinkFields,
    append: appendSocialLink,
    remove: removeSocialLink,
  } = useFieldArray({
    control,
    name: "socialLinks",
  });

  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      const response = await profileService.getContactDetails();
      setContactDetails(response.contactDetails);
      if (response.contactDetails) {
        reset({
          email: response.contactDetails.email,
          phones:
            response.contactDetails.phones &&
            response.contactDetails.phones.length > 0
              ? response.contactDetails.phones
              : [{ number: "", type: "mobile" }],
          addresses:
            response.contactDetails.addresses &&
            response.contactDetails.addresses.length > 0
              ? response.contactDetails.addresses
              : [{ street: "", city: "", country: "", type: "home" }],
          socialLinks:
            response.contactDetails.socialLinks &&
            response.contactDetails.socialLinks.length > 0
              ? response.contactDetails.socialLinks
              : [{ platform: "linkedin", url: "" }],
        });
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch contact details",
      );
    }
  };

  const onSubmit = async (data: ContactDetailsFormData) => {
    try {
      setSaving(true);
      const response = await profileService.updateContactDetails(data);
      setContactDetails(response.contactDetails);
      showSuccess("Contact details updated successfully");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update contact details",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Contact Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your contact information including email, phone numbers,
        addresses, and social links
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1.5}>
          {/* Email */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled
            />
          </Grid>

          {/* Phones */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Button
                startIcon={<Add />}
                onClick={() => appendPhone({ number: "", type: "mobile" })}
                disabled={phoneFields.length >= 2}
                size="small"
              >
                Add Phone
              </Button>
            </Box>
            {phoneFields.map((field, index) => (
              <Stack key={field.id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register(`phones.${index}.number`)}
                      error={!!errors.phones?.[index]?.number}
                      helperText={errors.phones?.[index]?.number?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name={`phones.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="Type"
                          error={!!errors.phones?.[index]?.type}
                          helperText={errors.phones?.[index]?.type?.message}
                        >
                          <MenuItem value="mobile">Mobile</MenuItem>
                          <MenuItem value="home">Home</MenuItem>
                          <MenuItem value="work">Work</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <IconButton
                      onClick={() => removePhone(index)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Stack>
            ))}
          </Grid>

          {/* Addresses */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Button
                startIcon={<Add />}
                onClick={() =>
                  appendAddress({
                    street: "",
                    city: "",
                    country: "",
                    type: "home",
                  })
                }
                disabled={addressFields.length >= 2}
                size="small"
              >
                Add Address
              </Button>
            </Box>
            {addressFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr 1fr",
                  },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Grid>
                  <TextField
                    fullWidth
                    label="Street"
                    {...register(`addresses.${index}.street`)}
                    error={!!errors.addresses?.[index]?.street}
                    helperText={errors.addresses?.[index]?.street?.message}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    label="City"
                    {...register(`addresses.${index}.city`)}
                    error={!!errors.addresses?.[index]?.city}
                    helperText={errors.addresses?.[index]?.city?.message}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    label="State"
                    {...register(`addresses.${index}.state`)}
                    error={!!errors.addresses?.[index]?.state}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    {...register(`addresses.${index}.zipCode`)}
                    error={!!errors.addresses?.[index]?.zipCode}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    label="Country"
                    {...register(`addresses.${index}.country`)}
                    error={!!errors.addresses?.[index]?.country}
                    helperText={errors.addresses?.[index]?.country?.message}
                  />
                </Grid>
                <Grid>
                  <Controller
                    name={`addresses.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Type"
                        error={!!errors.addresses?.[index]?.type}
                        helperText={errors.addresses?.[index]?.type?.message}
                      >
                        <MenuItem value="home">Home</MenuItem>
                        <MenuItem value="work">Work</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    onClick={() => removeAddress(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Box>
            ))}
          </Grid>

          {/* Social Links */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Button
                startIcon={<Add />}
                onClick={() =>
                  appendSocialLink({ platform: "linkedin", url: "" })
                }
                size="small"
                disabled={socialLinkFields.length >= 6}
              >
                Add Social Link
              </Button>
            </Box>
            {socialLinkFields.map((field, index) => (
              <Grid
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "3fr 7fr 2fr",
                  },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Grid>
                  <Controller
                    name={`socialLinks.${index}.platform`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Platform"
                        error={!!errors.socialLinks?.[index]?.platform}
                        helperText={
                          errors.socialLinks?.[index]?.platform?.message
                        }
                      >
                        <MenuItem value="linkedin">LinkedIn</MenuItem>
                        <MenuItem value="github">GitHub</MenuItem>
                        <MenuItem value="twitter">Twitter / X</MenuItem>
                        <MenuItem value="portfolio">Portfolio</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    label="URL"
                    {...register(`socialLinks.${index}.url`)}
                    error={!!errors.socialLinks?.[index]?.url}
                    helperText={errors.socialLinks?.[index]?.url?.message}
                  />
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    onClick={() => removeSocialLink(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              sx={{ mt: 2 }}
            >
              {saving ? "Saving..." : "Save Contact Details"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
