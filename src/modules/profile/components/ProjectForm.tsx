/**
 * ProjectForm Component
 * Form for creating and editing projects
 */

import { useEffect, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../utils/validation";
import { profileService, type Project } from "../services/profileService";
import { Add, Remove } from "@mui/icons-material";
import TextEditor from "@/common/components/TextEditor";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input, Select } from "@/common/components";

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
    <SideDrawer
      title={project ? "Edit Project" : "Add Project"}
      subTitle={project?.title || ""}
      open={open}
      onClose={loading ? undefined : onClose}
      loading={loading}
      footerActionClick={handleSubmit(onSubmit)}
      footerActionName={project ? "Update" : "Add"}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        <Input
          label="Project Title"
          name="title"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Box>
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
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
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
            <Select
              label="Project Type"
              {...field}
              disabled={loading}
              errors={errors}
              options={[
                { label: "Personal", value: "Personal" },
                { label: "Professional", value: "Professional" },
              ]}
            />
          )}
        />
        {projectType === "Professional" && (
          <Controller
            control={control}
            name="company"
            render={({ field }) => (
              <Select
                label="Company"
                {...field}
                disabled={loading || companiesLoading}
                errors={errors}
                emptyText="No companies available"
                options={companies.map((company) => ({
                  label: company.companyName,
                  value: company.companyName,
                }))}
              />
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
              <Input
                label=""
                name={`technologies.${index}`}
                placeholder="Enter technology"
                register={register}
                errors={errors}
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
        <Input
          label="Project URL"
          name="projectUrl"
          placeholder="https://example.com"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Input
          label="GitHub Repository"
          name="githubRepo"
          placeholder="https://github.com/username/repo"
          register={register}
          errors={errors}
          disabled={loading}
        />
      </Box>
    </SideDrawer>
  );
};
