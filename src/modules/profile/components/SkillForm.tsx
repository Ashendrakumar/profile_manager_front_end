/**
 * SkillForm Component
 * Form for creating and editing skills
 */

import { useEffect } from "react";
import { TextField, Box, MenuItem } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema } from "../utils/validation";
import type { Skill } from "../services/profileService";
import { SideDrawer } from "@/common/components/SideDrawer";

type SkillFormData = {
  name: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsOfExperience?: number;
};

interface SkillFormProps {
  open: boolean;
  skill?: Skill | null;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => Promise<void>;
  loading?: boolean;
}

export const SkillForm = ({
  open,
  skill,
  onClose,
  onSubmit,
  loading = false,
}: SkillFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      level: "BEGINNER",
      yearsOfExperience: undefined,
    },
  });

  useEffect(() => {
    if (skill) {
      reset({
        name: skill.name || "",
        category: skill.category || "",
        level: skill.level || "BEGINNER",
        yearsOfExperience: skill.yearsOfExperience,
      });
      console.log("skill", skill);
      setValue("level", skill.level || "BEGINNER");
    } else {
      reset({
        name: "",
        category: "",
        level: "BEGINNER",
        yearsOfExperience: undefined,
      });
    }
  }, [skill, reset, open]);

  return (
    <SideDrawer
      title={skill ? "Edit Skill" : "Add Skill"}
      subTitle={skill?.name || ""}
      open={open}
      onClose={loading ? undefined : onClose}
      loading={loading}
      footerActionClick={handleSubmit(onSubmit)}
      footerActionName={skill ? "Update" : "Add"}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        <TextField
          label="Skill Name"
          fullWidth
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          disabled={loading}
        />
        <TextField
          label="Category"
          fullWidth
          placeholder="e.g., Programming Languages, Frameworks, Tools"
          {...register("category")}
          error={!!errors.category}
          helperText={errors.category?.message}
          disabled={loading}
        />
        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Level"
              error={!!errors.level}
              helperText={errors.level?.message}
              disabled={loading}
            >
              <MenuItem value="BEGINNER">Beginner</MenuItem>
              <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
              <MenuItem value="ADVANCED">Advanced</MenuItem>
              <MenuItem value="EXPERT">Expert</MenuItem>
            </TextField>
          )}
        />
        <TextField
          label="Years of Experience"
          type="number"
          fullWidth
          InputProps={{ inputProps: { min: 0 } }}
          {...register("yearsOfExperience", { valueAsNumber: true })}
          error={!!errors.yearsOfExperience}
          helperText={errors.yearsOfExperience?.message}
          disabled={loading}
        />
      </Box>
    </SideDrawer>
  );
};
