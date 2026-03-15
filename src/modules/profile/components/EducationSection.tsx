/**
 * EducationSection Component
 * Manages education entries (CRUD)
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  // CardActions,
  Grid,
  IconButton,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Education } from "../services/profileService";
import { LoadingSpinner } from "@/common/components";
import { ConfirmDialog } from "@/common/components";
import { EducationForm } from "./EducationForm";
import { HelperFunctions } from "@/utils/helpers";

export const EducationSection = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<Education | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const response = await profileService.getEducation();
      setEducation(response.education);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch education",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEducation(null);
    setFormOpen(true);
  };

  const handleEdit = (edu: Education) => {
    setSelectedEducation(edu);
    setFormOpen(true);
  };

  const handleDelete = (edu: Education) => {
    setEducationToDelete(edu);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);
      if (selectedEducation?._id) {
        await profileService.updateEducation(selectedEducation._id, data);
        showSuccess("Education updated successfully");
      } else {
        await profileService.addEducation(data);
        showSuccess("Education added successfully");
      }
      setFormOpen(false);
      setSelectedEducation(null);
      await fetchEducation();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save education",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!educationToDelete?._id) return;

    try {
      setActionLoading(true);
      await profileService.deleteEducation(educationToDelete._id);
      showSuccess("Education deleted successfully");
      setDeleteDialogOpen(false);
      setEducationToDelete(null);
      await fetchEducation();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete education",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
            Education
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your educational background
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Education
        </Button>
      </Box>

      {education.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No education entries yet. Add your first one!
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
          {education.map((edu) => (
            <Grid key={edu._id}>
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
                      {HelperFunctions.capitalizeString(edu.standard)}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(edu)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(edu)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {HelperFunctions.capitalizeString(edu.institution)}
                  </Typography>
                  {edu.university && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {HelperFunctions.capitalizeString(edu.university)}
                    </Typography>
                  )}
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}
                  >
                    <Chip
                      label={`Passing Year: ${edu.passingYear}`}
                      size="small"
                    />
                    {edu.grade && (
                      <Chip label={`Grade: ${edu.grade}`} size="small" />
                    )}
                    {edu.specialization && (
                      <Chip
                        label={edu.specialization}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <EducationForm
        open={formOpen}
        education={selectedEducation}
        onClose={() => {
          setFormOpen(false);
          setSelectedEducation(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Education"
        message={`Are you sure you want to delete "${educationToDelete?.standard}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setEducationToDelete(null);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};
