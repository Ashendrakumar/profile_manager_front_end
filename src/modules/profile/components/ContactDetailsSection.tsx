/**
 * ContactDetailsSection Component
 * Manages contact details (email, phones, addresses, social links)
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Delete,
  Save,
  Email,
  Phone,
  Home,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type ContactDetails,
} from "../services/profileService";
import { contactDetailsSchema } from "../utils/validation";
import { Input, Select } from "@/common/components";
import { SkeletonLoader } from "@/common/components/SkeletonLoader";

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

const MAX_PHONES = 2;
const MAX_ADDRESSES = 2;
const MAX_SOCIAL_LINKS = 6;

const DEFAULT_PHONE = { number: "", type: "mobile" as const };
const DEFAULT_ADDRESS = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  type: "home" as const,
};
const DEFAULT_SOCIAL_LINK = { platform: "linkedin" as const, url: "" };

// ── Reusable "section card" wrapper ─────────────────────────────────────────
const SectionCardShell = ({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card variant="outlined" sx={{ mb: 2.5 }}>
    <CardHeader
      avatar={icon}
      title={
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      }
      subheader={subtitle}
      action={action}
      sx={{ pb: 1 }}
    />
    <Divider />
    <CardContent sx={{ pt: 2.5 }}>{children}</CardContent>
  </Card>
);

export const ContactDetailsSection = () => {
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setContactDetails] = useState<ContactDetails | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email: "",
      phones: [DEFAULT_PHONE],
      addresses: [DEFAULT_ADDRESS],
      socialLinks: [DEFAULT_SOCIAL_LINK],
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: "phones" });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({ control, name: "addresses" });

  const {
    fields: socialLinkFields,
    append: appendSocialLink,
    remove: removeSocialLink,
  } = useFieldArray({ control, name: "socialLinks" });

  useEffect(() => {
    fetchContactDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await profileService.getContactDetails();
      setContactDetails(response.contactDetails);
      if (response.contactDetails) {
        reset({
          email: response.contactDetails.email,
          phones: response.contactDetails.phones?.length
            ? response.contactDetails.phones
            : [DEFAULT_PHONE],
          addresses: response.contactDetails.addresses?.length
            ? response.contactDetails.addresses
            : [DEFAULT_ADDRESS],
          socialLinks: response.contactDetails.socialLinks?.length
            ? response.contactDetails.socialLinks
            : [DEFAULT_SOCIAL_LINK],
        });
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch contact details",
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactDetailsFormData) => {
    try {
      setSaving(true);
      const response = await profileService.updateContactDetails(data);
      setContactDetails(response.contactDetails);
      reset(data); // resets isDirty baseline to the just-saved values
      showSuccess("Contact details updated successfully");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update contact details",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Contact Details
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your contact information including email, phone numbers,
          addresses, and social links
        </Typography>
        <SkeletonLoader variant="list" count={4} lines={2} showActions />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Contact Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your contact information including email, phone numbers,
        addresses, and social links
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── Email ──────────────────────────────────────────────────────── */}
        <SectionCardShell icon={<Email color="primary" />} title="Email">
          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            disabled
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Your email is tied to your account and can't be changed here.
          </Typography>
        </SectionCardShell>

        {/* ── Phones ─────────────────────────────────────────────────────── */}
        <SectionCardShell
          icon={<Phone color="primary" />}
          title="Phone Numbers"
          subtitle={`${phoneFields.length} of ${MAX_PHONES} added`}
          action={
            <Tooltip
              title={
                phoneFields.length >= MAX_PHONES
                  ? `Maximum ${MAX_PHONES} phone numbers`
                  : ""
              }
            >
              <span>
                <Button
                  startIcon={<Add />}
                  onClick={() => appendPhone(DEFAULT_PHONE)}
                  disabled={phoneFields.length >= MAX_PHONES}
                  size="small"
                >
                  Add Phone
                </Button>
              </span>
            </Tooltip>
          }
        >
          <Stack spacing={2}>
            {phoneFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 160px auto" },
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Input
                  label="Phone Number"
                  name={`phones.${index}.number`}
                  register={register}
                  errors={errors}
                />
                <Controller
                  name={`phones.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Type"
                      errors={errors}
                      options={[
                        { label: "Mobile", value: "mobile" },
                        { label: "Home", value: "home" },
                        { label: "Work", value: "work" },
                      ]}
                    />
                  )}
                />
                <IconButton
                  onClick={() => removePhone(index)}
                  color="error"
                  size="small"
                  aria-label="Remove phone number"
                  disabled={phoneFields.length === 1}
                  sx={{ mt: { xs: 0, sm: 1 } }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </SectionCardShell>

        {/* ── Addresses ──────────────────────────────────────────────────── */}
        <SectionCardShell
          icon={<Home color="primary" />}
          title="Addresses"
          subtitle={`${addressFields.length} of ${MAX_ADDRESSES} added`}
          action={
            <Tooltip
              title={
                addressFields.length >= MAX_ADDRESSES
                  ? `Maximum ${MAX_ADDRESSES} addresses`
                  : ""
              }
            >
              <span>
                <Button
                  startIcon={<Add />}
                  onClick={() => appendAddress(DEFAULT_ADDRESS)}
                  disabled={addressFields.length >= MAX_ADDRESSES}
                  size="small"
                >
                  Add Address
                </Button>
              </span>
            </Tooltip>
          }
        >
          <Stack spacing={3}>
            {addressFields.map((field, index) => (
              <Box key={field.id}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "2fr 1.5fr 1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  <Input
                    label="Street"
                    name={`addresses.${index}.street`}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="City"
                    name={`addresses.${index}.city`}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="State"
                    name={`addresses.${index}.state`}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zip Code"
                    name={`addresses.${index}.zipCode`}
                    register={register}
                    errors={errors}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 160px auto" },
                    gap: 2,
                    mt: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <Input
                    label="Country"
                    name={`addresses.${index}.country`}
                    register={register}
                    errors={errors}
                  />
                  <Controller
                    name={`addresses.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Type"
                        errors={errors}
                        options={[
                          { label: "Home", value: "home" },
                          { label: "Work", value: "work" },
                        ]}
                      />
                    )}
                  />
                  <IconButton
                    onClick={() => removeAddress(index)}
                    color="error"
                    size="small"
                    aria-label="Remove address"
                    disabled={addressFields.length === 1}
                    sx={{ mt: { xs: 0, sm: 1 } }}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {index < addressFields.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}
          </Stack>
        </SectionCardShell>

        {/* ── Social Links ───────────────────────────────────────────────── */}
        <SectionCardShell
          icon={<LinkIcon color="primary" />}
          title="Social Links"
          subtitle={`${socialLinkFields.length} of ${MAX_SOCIAL_LINKS} added`}
          action={
            <Tooltip
              title={
                socialLinkFields.length >= MAX_SOCIAL_LINKS
                  ? `Maximum ${MAX_SOCIAL_LINKS} links`
                  : ""
              }
            >
              <span>
                <Button
                  startIcon={<Add />}
                  onClick={() => appendSocialLink(DEFAULT_SOCIAL_LINK)}
                  size="small"
                  disabled={socialLinkFields.length >= MAX_SOCIAL_LINKS}
                >
                  Add Social Link
                </Button>
              </span>
            </Tooltip>
          }
        >
          <Stack spacing={2}>
            {socialLinkFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "180px 1fr auto" },
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Controller
                  name={`socialLinks.${index}.platform`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Platform"
                      errors={errors}
                      options={[
                        { label: "LinkedIn", value: "linkedin" },
                        { label: "GitHub", value: "github" },
                        { label: "Twitter / X", value: "twitter" },
                        { label: "Portfolio", value: "portfolio" },
                      ]}
                    />
                  )}
                />
                <Input
                  label="URL"
                  name={`socialLinks.${index}.url`}
                  register={register}
                  errors={errors}
                />
                <IconButton
                  onClick={() => removeSocialLink(index)}
                  color="error"
                  size="small"
                  aria-label="Remove social link"
                  sx={{ mt: { xs: 0, sm: 1 } }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </SectionCardShell>

        {/* ── Sticky-ish save bar ────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            mt: 1,
          }}
        >
          {!isDirty && !saving && (
            <Typography variant="caption" color="text.secondary">
              No changes to save
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !isDirty}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? "Saving..." : "Save Contact Details"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};
