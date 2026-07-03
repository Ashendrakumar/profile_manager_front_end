/**
 * SkillForm Component
 * Form for creating and editing skills
 */

import { useEffect } from "react";
import { Box } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema } from "../utils/validation";
import type { Skill } from "../services/profileService";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, Select } from "@/common/components";

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
        <Input
          label="Skill Name"
          name="name"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Input
          label="Category"
          name="category"
          placeholder="e.g., Programming Languages, Frameworks, Tools"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Level"
              errors={errors}
              disabled={loading}
              options={[
                { label: "Beginner", value: "BEGINNER" },
                { label: "Intermediate", value: "INTERMEDIATE" },
                { label: "Advanced", value: "ADVANCED" },
                { label: "Expert", value: "EXPERT" },
              ]}
            />
          )}
        />
        <Input
          label="Years of Experience"
          name="yearsOfExperience"
          type="number"
          InputProps={{ inputProps: { min: 0 } }}
          register={register}
          errors={errors}
          rules={{ valueAsNumber: true }}
          disabled={loading}
        />
      </Box>
    </SideDrawer>
  );
};
