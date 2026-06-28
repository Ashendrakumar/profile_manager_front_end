/**
 * ProjectsSection Component
 * Manages projects (CRUD)
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Link,
} from "@mui/material";
import { Add, Edit, Delete, Launch, Code } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Project } from "../services/profileService";
import { ConfirmDialog } from "@/common/components";
import { ProjectForm } from "./ProjectForm";
import { HelperFunctions } from "@/utils/helpers";

export const ProjectsSection = () => {
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // setLoading(true)
      const response = await profileService.getProjects();
      setProjects(response.projects);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch projects",
      );
    } finally {
      // setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleDelete = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);
      if (selectedProject?._id) {
        await profileService.updateProject(selectedProject._id, data);
        showSuccess("Project updated successfully");
      } else {
        await profileService.addProject(data);
        showSuccess("Project added successfully");
      }
      setFormOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete?._id) return;

    try {
      setActionLoading(true);
      await profileService.deleteProject(projectToDelete._id);
      showSuccess("Project deleted successfully");
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete project",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showcase your projects and work
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          <Typography sx={{ display: { xs: "none", sm: "block" } }}>
            Add
          </Typography>
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No projects yet. Add your first one!
          </Typography>
        </Box>
      ) : (
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 2,
          }}
        >
          {projects.map((project) => (
            <Grid key={project._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {HelperFunctions.capitalizeString(project.title)}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(project)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(project)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    {project.projectType && (
                      <Chip
                        label={project.projectType}
                        size="small"
                        color={
                          project.projectType === "Professional"
                            ? "primary"
                            : "default"
                        }
                        sx={{ mr: 1 }}
                      />
                    )}
                  </Box>
                  {project.company && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Company: {project.company}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      "& p": { mb: 1 },
                      "& ul": { mb: 1 },
                      "& li": { mb: 0.5 },
                      "& strong": { fontWeight: "bold" },
                      "& em": { fontStyle: "italic" },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: project.description,
                    }}
                  />
                  {project.technologies && project.technologies.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <Typography variant="body2" color="text.secondary">
                          Technologies :
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {project.technologies.map((tech, idx) => (
                          <Chip
                            key={idx}
                            label={tech}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {project.projectUrl && (
                      <Link
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Chip
                          icon={<Launch />}
                          label="Live Demo "
                          size="small"
                          clickable
                          color="primary"
                        />
                      </Link>
                    )}
                    {project.githubRepo && (
                      <Link
                        href={project.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Chip
                          icon={<Code />}
                          label="GitHub "
                          size="small"
                          clickable
                        />
                      </Link>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ProjectForm
        open={formOpen}
        project={selectedProject}
        onClose={() => {
          setFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};
