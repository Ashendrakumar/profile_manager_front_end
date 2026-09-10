/**
 * EducationSection Component
 * Manages education entries (CRUD)
 */

import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  School,
  Business,
  AccountBalance,
} from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Education } from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  EntityCard,
  type EntityCardChip,
  ResponsiveButton,
  PageHeader,
  EmptyState,
} from "@/common/components";
import { EducationForm } from "./EducationForm";
import { HelperFunctions } from "@/utils/helpers";

export const EducationSection = () => {
  const { showSuccess, showError } = useToast();
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
  const [loading, setLoading] = useState(true);

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

  return (
    <Box>
      <PageHeader
        title="Education"
        subtitle="Manage your educational background"
        count={education.length}
        action={
          <ResponsiveButton collapseBreakpoint="sm" icon={<Add />} onClick={handleAdd}>
            Add Education
          </ResponsiveButton>
        }
      />

      {loading ? (
        <SkeletonLoader count={3} minItemWidth={320} gap={3} lines={2} />
      ) : education.length === 0 ? (
        <EmptyState
          icon={<School />}
          title="No education yet"
          description="Add your degrees, schools and qualifications to complete your profile."
          onClick={handleAdd}
        />
      ) : (
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
          }}
        >
          {education.map((edu) => {
            const chips: EntityCardChip[] = [
              { label: `Passing Year: ${edu.passingYear}` },
            ];
            if (edu.grade) chips.push({ label: `Grade: ${edu.grade}` });
            if (edu.specialization)
              chips.push({ label: edu.specialization, color: "primary" });

            return (
              <Grid key={edu._id}>
                <EntityCard
                  title={HelperFunctions.capitalizeString(edu.standard)}
                  avatar={<School />}
                  info={[
                    {
                      icon: <Business fontSize="small" />,
                      text: HelperFunctions.capitalizeString(edu.institution),
                    },
                    ...(edu.university
                      ? [
                          {
                            icon: <AccountBalance fontSize="small" />,
                            text: HelperFunctions.capitalizeString(
                              edu.university,
                            ),
                          },
                        ]
                      : []),
                  ]}
                  chips={chips}
                  actions={[
                    {
                      label: "Edit",
                      icon: <Edit fontSize="small" />,
                      onClick: () => handleEdit(edu),
                    },
                    {
                      label: "Delete",
                      icon: <Delete fontSize="small" />,
                      color: "error",
                      dividerBefore: true,
                      onClick: () => handleDelete(edu),
                    },
                  ]}
                />
              </Grid>
            );
          })}
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
