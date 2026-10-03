/**
 * ContactDetailsDrawer
 * Edit form for contact details (email, phones, addresses, social links) in the
 * shared SideDrawer. Reuses `contactDetailsSchema`, Input/Select and
 * react-hook-form field arrays. Save is wired to the drawer footer.
 */

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Stack,
  IconButton,
  Button,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, Select } from "@/common/components";
import { useToast } from "@/contexts/toastContext";
import { profileService, type ContactDetails } from "../services/profileService";
import { contactDetailsSchema } from "../utils/validation";

type FormData = {
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
const DEFAULT_SOCIAL = { platform: "linkedin" as const, url: "" };

const GroupLabel = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 1.5,
      mt: 1,
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
    >
      {title}
    </Typography>
    {action}
  </Box>
);

interface Props {
  open: boolean;
  onClose: () => void;
  contactDetails: ContactDetails | null;
  onSaved: (updated: ContactDetails) => void;
}

export const ContactDetailsDrawer = ({
  open,
  onClose,
  contactDetails,
  onSaved,
}: Props) => {
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email: "",
      phones: [DEFAULT_PHONE],
      addresses: [DEFAULT_ADDRESS],
      socialLinks: [DEFAULT_SOCIAL],
    },
  });

  const phones = useFieldArray({ control, name: "phones" });
  const addresses = useFieldArray({ control, name: "addresses" });
  const socials = useFieldArray({ control, name: "socialLinks" });

  useEffect(() => {
    if (open && contactDetails) {
      reset({
        email: contactDetails.email ?? "",
        phones: contactDetails.phones?.length ? contactDetails.phones : [DEFAULT_PHONE],
        addresses: contactDetails.addresses?.length
          ? contactDetails.addresses
          : [DEFAULT_ADDRESS],
        socialLinks: contactDetails.socialLinks?.length
          ? contactDetails.socialLinks
          : [DEFAULT_SOCIAL],
      });
    }
  }, [open, contactDetails, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const res = await profileService.updateContactDetails(data);
      showSuccess("Contact details updated");
      onSaved(res.contactDetails);
      onClose();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update contact details",
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
      title="Edit Contact Details"
      subTitle="Update how people reach you"
      footerActionName={saving ? "Saving…" : "Save changes"}
      footerActionClick={handleSubmit(onSubmit)}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email (read-only, tied to account) */}
        <GroupLabel title="Email" />
        <Input label="Email" name="email" type="email" register={register} errors={errors} disabled />

        <Divider sx={{ my: 2.5 }} />

        {/* Phones */}
        <GroupLabel
          title={`Phone numbers · ${phones.fields.length}/${MAX_PHONES}`}
          action={
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => phones.append(DEFAULT_PHONE)}
              disabled={phones.fields.length >= MAX_PHONES}
            >
              Add
            </Button>
          }
        />
        <Stack spacing={2}>
          {phones.fields.map((field, i) => (
            <Box
              key={field.id}
              sx={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: 1.5, alignItems: "start" }}
            >
              <Input label="Number" name={`phones.${i}.number`} register={register} errors={errors} />
              <Controller
                name={`phones.${i}.type`}
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
                onClick={() => phones.remove(i)}
                color="error"
                size="small"
                disabled={phones.fields.length === 1}
                aria-label="Remove phone"
                sx={{ mt: 1 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Addresses */}
        <GroupLabel
          title={`Addresses · ${addresses.fields.length}/${MAX_ADDRESSES}`}
          action={
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => addresses.append(DEFAULT_ADDRESS)}
              disabled={addresses.fields.length >= MAX_ADDRESSES}
            >
              Add
            </Button>
          }
        />
        <Stack spacing={3}>
          {addresses.fields.map((field, i) => (
            <Box key={field.id}>
              <Stack spacing={1.5}>
                <Input label="Street" name={`addresses.${i}.street`} register={register} errors={errors} />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Input label="City" name={`addresses.${i}.city`} register={register} errors={errors} />
                  <Input label="State" name={`addresses.${i}.state`} register={register} errors={errors} />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Input label="Zip Code" name={`addresses.${i}.zipCode`} register={register} errors={errors} />
                  <Input label="Country" name={`addresses.${i}.country`} register={register} errors={errors} />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1.5, alignItems: "start" }}>
                  <Controller
                    name={`addresses.${i}.type`}
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
                  <Tooltip title="Remove address">
                    <span>
                      <IconButton
                        onClick={() => addresses.remove(i)}
                        color="error"
                        size="small"
                        disabled={addresses.fields.length === 1}
                        aria-label="Remove address"
                        sx={{ mt: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>
              {i < addresses.fields.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Social links */}
        <GroupLabel
          title={`Social links · ${socials.fields.length}/${MAX_SOCIAL_LINKS}`}
          action={
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => socials.append(DEFAULT_SOCIAL)}
              disabled={socials.fields.length >= MAX_SOCIAL_LINKS}
            >
              Add
            </Button>
          }
        />
        <Stack spacing={2}>
          {socials.fields.map((field, i) => (
            <Box key={field.id}>
              <Controller
                name={`socialLinks.${i}.platform`}
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
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1.5, alignItems: "start", mt: 1.5 }}>
                <Input label="URL" name={`socialLinks.${i}.url`} register={register} errors={errors} />
                <IconButton
                  onClick={() => socials.remove(i)}
                  color="error"
                  size="small"
                  aria-label="Remove social link"
                  sx={{ mt: 1 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </SideDrawer>
  );
};
