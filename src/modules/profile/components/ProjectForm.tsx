/**
 * ProjectForm Component
 * Form for creating and editing projects
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../utils/validation";
import { profileService, type Project } from "../services/profileService";
import { Add, Remove } from "@mui/icons-material";
import TextEditor from "@/common/components/TextEditor";

type ProjectFormData = {
  title: string;
  description: string;
  projectType: "Personal" | "Professional";
  company?: string;
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
  const [companies, setCompanies] = useState<
    Array<{ companyName: string; id: string }>
  >([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      projectType: "Personal",
      company: "",
      technologies: [],
      projectUrl: "",
      githubRepo: "",
    },
  });

  const projectType = watch("projectType");

  const {
    fields: technologyFields,
    append: appendTechnology,
    remove: removeTechnology,
  } = useFieldArray({
    control: control as any,
    name: "technologies",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const response = await profileService.getCompanies();
        setCompanies(response.companies);
      } catch (err) {
        console.error("Failed to fetch companies");
        setCompanies([]);
      } finally {
        setCompaniesLoading(false);
      }
    };

    if (open) {
      fetchCompanies();
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      reset({
        title: project.title || "",
        description: project.description || "",
        projectType: project.projectType || "Personal",
        company: project.company || "",
        technologies: project.technologies || [],
        projectUrl: project.projectUrl || "",
        githubRepo: project.githubRepo || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        projectType: "Personal",
        company: "",
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
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Box>
                  {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Description
                  </Typography> */}
                  <TextEditor
                    isNormalField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter project description"
                    className={fieldState.error ? "editor-error" : ""}
                    style={{
                      border: fieldState.error ? "1px solid #d32f2f" : "none",
                      borderRadius: "4px",
                    }}
                  />
                  {fieldState.error && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {fieldState.error.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
            <Controller
              control={control}
              name="projectType"
              render={({ field }) => (
                <TextField
                  select
                  label="Project Type"
                  fullWidth
                  {...field}
                  disabled={loading}
                  error={!!errors.projectType}
                  helperText={errors.projectType?.message}
                >
                  <MenuItem value="Personal">Personal</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                </TextField>
              )}
            />
            {projectType === "Professional" && (
              <Controller
                control={control}
                name="company"
                render={({ field }) => (
                  <TextField
                    select
                    label="Company"
                    fullWidth
                    {...field}
                    disabled={loading || companiesLoading}
                    error={!!errors.company}
                    helperText={errors.company?.message}
                  >
                    {companies.length === 0 ? (
                      <MenuItem disabled>No companies available</MenuItem>
                    ) : (
                      companies.map((company) => (
                        <MenuItem key={company.id} value={company.companyName}>
                          {company.companyName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}
              />
            )}
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
