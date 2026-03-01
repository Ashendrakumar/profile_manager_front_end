/**
 * ProjectForm Component
 * Form for creating and editing projects
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
  Typography,
  IconButton,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../utils/validation";
import type { Project } from "../services/profileService";
import { Add, Remove } from "@mui/icons-material";

type ProjectFormData = {
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubRepo?: string;
};

interface ProjectFormProps {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  loading?: boolean;
}

export const ProjectForm = ({
  open,
  project,
  onClose,
  onSubmit,
  loading = false,
}: ProjectFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      technologies: [],
      projectUrl: "",
      githubRepo: "",
    },
  });

  const {
    fields: technologyFields,
    append: appendTechnology,
    remove: removeTechnology,
  } = useFieldArray({
    control: control as any,
    name: "technologies",
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title || "",
        description: project.description || "",
        technologies: project.technologies || [],
        projectUrl: project.projectUrl || "",
        githubRepo: project.githubRepo || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        technologies: [],
        projectUrl: "",
        githubRepo: "",
      });
    }
  }, [project, reset, open]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Project Title"
              fullWidth
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
              disabled={loading}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={loading}
            />
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">Technologies</Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => appendTechnology("")}
                  disabled={loading}
                >
                  <Add />
                </IconButton>
              </Box>
              {technologyFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 1,
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter technology"
                    {...register(`technologies.${index}`)}
                    disabled={loading}
                  />
                  <Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeTechnology(index)}
                      disabled={loading}
                    >
                      <Remove />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            <TextField
              label="Project URL"
              fullWidth
              placeholder="https://example.com"
              {...register("projectUrl")}
              error={!!errors.projectUrl}
              helperText={errors.projectUrl?.message}
              disabled={loading}
            />
            <TextField
              label="GitHub Repository"
              fullWidth
              placeholder="https://github.com/username/repo"
              {...register("githubRepo")}
              error={!!errors.githubRepo}
              helperText={errors.githubRepo?.message}
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
            {project ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
