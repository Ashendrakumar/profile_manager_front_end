/**
 * ExperienceSection Component
 * Manages experience entries (CRUD)
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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Experience } from "../services/profileService";
import { ConfirmDialog } from "@/common/components";
import { ExperienceForm } from "./ExperienceForm";
import { HelperFunctions } from "@/utils/helpers";

export const ExperienceSection = () => {
  const { showSuccess, showError } = useToast();
  const [experience, setExperience] = useState<Experience[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] =
    useState<Experience | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      // setLoading(true);
      const response = await profileService.getExperience();
      setExperience(response.experience);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch experience",
      );
    } finally {
      // setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedExperience(null);
    setFormOpen(true);
  };

  const handleEdit = (exp: Experience) => {
    setSelectedExperience(exp);
    setFormOpen(true);
  };

  const handleDelete = (exp: Experience) => {
    setExperienceToDelete(exp);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);
      if (selectedExperience?._id) {
        await profileService.updateExperience(selectedExperience._id, data);
        showSuccess("Experience updated successfully");
      } else {
        await profileService.addExperience(data);
        showSuccess("Experience added successfully");
      }
      setFormOpen(false);
      setSelectedExperience(null);
      await fetchExperience();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save experience",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!experienceToDelete?._id) return;

    try {
      setActionLoading(true);
      await profileService.deleteExperience(experienceToDelete._id);
      showSuccess("Experience deleted successfully");
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
      await fetchExperience();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete experience",
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
            Experience
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your work experience
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          <Typography sx={{ display: { xs: "none", sm: "block" } }}>
            Add
          </Typography>
        </Button>
      </Box>

      {experience.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No experience entries yet. Add your first one!
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
          {experience.map((exp) => (
            <Grid key={exp._id}>
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
                      {HelperFunctions.capitalizeString(exp.role)}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(exp)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(exp)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {HelperFunctions.capitalizeString(exp.companyName)}
                  </Typography>
                  {exp.roleDescription && (
                    <Box
                      sx={{
                        mb: 2,
                        fontSize: "0.875rem",
                        "& p": { margin: 0 },
                        "& ol, & ul": { marginLeft: "1.5rem" },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: exp.roleDescription,
                      }}
                    />
                  )}
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    <Chip
                      label={`${new Date(exp.startDate).toLocaleDateString()} - ${
                        exp.isCurrentlyWorking
                          ? "Present"
                          : exp.endDate
                            ? new Date(exp.endDate).toLocaleDateString()
                            : "N/A"
                      }`}
                      size="small"
                    />
                    {exp.isCurrentlyWorking && (
                      <Chip label="Current" size="small" color="success" />
                    )}
                    {exp.projects && exp.projects.length > 0 && (
                      <Chip
                        label={`${exp.projects.length} Project${exp.projects.length !== 1 ? "s" : ""}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      {exp.technologiesUsed.map((tech, idx) => (
                        <Chip
                          key={idx}
                          label={tech}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ExperienceForm
        open={formOpen}
        experience={selectedExperience}
        onClose={() => {
          setFormOpen(false);
          setSelectedExperience(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Experience"
        message={`Are you sure you want to delete "${experienceToDelete?.role}" at "${experienceToDelete?.companyName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setExperienceToDelete(null);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};
