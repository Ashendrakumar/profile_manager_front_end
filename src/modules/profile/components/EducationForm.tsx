/**
 * EducationForm Component
 * Form for creating and editing education entries
 */

import { useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "../utils/validation";
import type { Education } from "../services/profileService";
import { SideDrawer } from "@/common/components/SideDrawer";

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
          <TextField
            label="Standard/Degree"
            fullWidth
            {...register("standard")}
            error={!!errors.standard}
            helperText={errors.standard?.message}
            disabled={loading}
          />
          <TextField
            label="Institution"
            fullWidth
            {...register("institution")}
            error={!!errors.institution}
            helperText={errors.institution?.message}
            disabled={loading}
          />
          <TextField
            label="University"
            fullWidth
            {...register("university")}
            error={!!errors.university}
            helperText={errors.university?.message}
            disabled={loading}
          />
          <TextField
            label="Passing Year"
            type="number"
            fullWidth
            {...register("passingYear", { valueAsNumber: true })}
            error={!!errors.passingYear}
            helperText={errors.passingYear?.message}
            disabled={loading}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <TextField
              label="Specialization"
              fullWidth
              {...register("specialization")}
              error={!!errors.specialization}
              helperText={errors.specialization?.message}
              disabled={loading}
            />

            <TextField
              label="Grade"
              fullWidth
              {...register("grade")}
              error={!!errors.grade}
              helperText={errors.grade?.message}
              disabled={loading}
            />
          </Box>
        </Box>
      </form>
    </SideDrawer>
  );
};
