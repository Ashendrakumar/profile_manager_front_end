/**
 * EducationForm Component
 * Form for creating and editing education entries
 */

import { useEffect } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "../utils/validation";
import type { Education } from "../services/profileService";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input } from "@/common/components";

type EducationFormData = {
  standard: string;
  institution: string;
  university?: string;
  passingYear: number;
  grade?: string;
  specialization?: string;
};

interface EducationFormProps {
  open: boolean;
  education?: Education | null;
  onClose: () => void;
  onSubmit: (data: EducationFormData) => Promise<void>;
  loading?: boolean;
}

export const EducationForm = ({
  open,
  education,
  onClose,
  onSubmit,
  loading = false,
}: EducationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      standard: "",
      institution: "",
      university: "",
      passingYear: new Date().getFullYear(),
      grade: "",
      specialization: "",
    },
  });

  // Reset form when education changes
  useEffect(() => {
    if (education) {
      reset({
        standard: education.standard || "",
        institution: education.institution || "",
        university: education.university || "",
        passingYear: education.passingYear || new Date().getFullYear(),
        grade: education.grade || "",
        specialization: education.specialization || "",
      });
    } else {
      reset({
        standard: "",
        institution: "",
        university: "",
        passingYear: new Date().getFullYear(),
        grade: "",
        specialization: "",
      });
    }
  }, [education, reset, open]);

  return (
    <SideDrawer
      open={open}
      onClose={loading ? undefined : onClose}
      loading={loading}
      title={education ? "Edit Education" : "Add Education"}
      subTitle={education?.standard}
      footerActionClick={handleSubmit(onSubmit)}
      footerActionName={education ? "Update" : "Add"}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <Input
            label="Standard/Degree"
            name="standard"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <Input
            label="Institution"
            name="institution"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <Input
            label="University"
            name="university"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <Input
            label="Passing Year"
            name="passingYear"
            type="number"
            register={register}
            errors={errors}
            rules={{ valueAsNumber: true }}
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
              label="Specialization"
              name="specialization"
              register={register}
              errors={errors}
              disabled={loading}
            />

            <Input
              label="Grade"
              name="grade"
              register={register}
              errors={errors}
              disabled={loading}
            />
          </Box>
        </Box>
      </form>
    </SideDrawer>
  );
};
