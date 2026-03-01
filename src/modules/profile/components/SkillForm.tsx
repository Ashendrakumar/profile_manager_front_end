/**
 * SkillForm Component
 * Form for creating and editing skills
 */

import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema } from "../utils/validation";
import type { Skill } from "../services/profileService";

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
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{skill ? "Edit Skill" : "Add Skill"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
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
            <TextField
              label="Level"
              select
              fullWidth
              {...register("level")}
              error={!!errors.level}
              helperText={errors.level?.message}
              disabled={loading}
            >
              <MenuItem value="BEGINNER">Beginner</MenuItem>
              <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
              <MenuItem value="ADVANCED">Advanced</MenuItem>
              <MenuItem value="EXPERT">Expert</MenuItem>
            </TextField>
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
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {skill ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
