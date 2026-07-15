/**
 * CertificationForm Component
 * Form for creating and editing certification entries
 */

import { useEffect } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificationSchema } from "../utils/validation";
import type { Certification } from "../services/profileService";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, TextArea } from "@/common/components";

type CertificationFormData = {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
};

interface CertificationFormProps {
  open: boolean;
  certification?: Certification | null;
  onClose: () => void;
  onSubmit: (data: CertificationFormData) => Promise<void>;
  loading?: boolean;
}

export const CertificationForm = ({
  open,
  certification,
  onClose,
  onSubmit,
  loading = false,
}: CertificationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    if (certification) {
      reset({
        title: certification.title || "",
        issuer: certification.issuer || "",
        issueDate: certification.issueDate || "",
        expiryDate: certification.expiryDate || "",
        credentialId: certification.credentialId || "",
        credentialUrl: certification.credentialUrl || "",
        description: certification.description || "",
      });
    } else {
      reset({
        title: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
        description: "",
      });
    }
  }, [certification, reset, open]);

  return (
    <SideDrawer
      open={open}
      onClose={loading ? undefined : onClose}
      loading={loading}
      title={certification ? "Edit Certification" : "Add Certification"}
      subTitle={certification?.title}
      footerActionClick={handleSubmit(onSubmit)}
      footerActionName={certification ? "Update" : "Add"}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <Input
            label="Certificate Title"
            name="title"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <Input
            label="Issuer"
            name="issuer"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Input
              label="Issue Date"
              name="issueDate"
              type="date"
              register={register}
              errors={errors}
              disabled={loading}
            />
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              register={register}
              errors={errors}
              disabled={loading}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Input
              label="Credential ID"
              name="credentialId"
              register={register}
              errors={errors}
              disabled={loading}
            />
            <Input
              label="Credential URL"
              name="credentialUrl"
              type="url"
              register={register}
              errors={errors}
              disabled={loading}
            />
          </Box>
          <TextArea
            label="Description"
            name="description"
            register={register}
            errors={errors}
            rows={4}
            disabled={loading}
          />
        </Box>
      </form>
    </SideDrawer>
  );
};
