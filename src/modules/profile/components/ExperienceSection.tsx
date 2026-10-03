/**
 * ExperienceSection Component
 * Manages experience entries (CRUD)
 */

import { useState, useEffect, useMemo } from "react";
import { Box, Grid } from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Work,
  CalendarMonth,
  FolderOutlined,
} from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Experience } from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  EntityCard,
  type EntityCardChip,
  ResponsiveButton,
  PageHeader,
  EmptyState,
} from "@/common/components";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      const response = await profileService.getExperience();
      setExperience(response.experience);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch experience",
      );
    } finally {
      setLoading(false);
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

  // Newest first, with the current role leading.
  const sortedExperience = useMemo(
    () =>
      HelperFunctions.sortByRecency(experience, (exp) => exp.startDate, {
        isOngoing: (exp) => exp.isCurrentlyWorking,
      }),
    [experience],
  );

  return (
    <Box>
      <PageHeader
        title="Experience"
        subtitle="Manage your work experience"
        count={experience.length}
        action={
          <ResponsiveButton collapseBreakpoint="sm" icon={<Add />} onClick={handleAdd}>
            Add Experience
          </ResponsiveButton>
        }
      />

      {loading ? (
        <SkeletonLoader
          count={4}
          minItemWidth={320}
          gap={3}
          lines={3}
          showActions={false}
        />
      ) : experience.length === 0 ? (
        <EmptyState
          icon={<Work />}
          title="No experience yet"
          description="Add your roles and work history to showcase your career journey."
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
          {sortedExperience.map((exp) => {
            // Row 1 — the facts about the role: when, whether it's live, how
            // much was shipped. Row 2 (below) is the tech stack, kept separate
            // so a long stack never pushes the dates onto another line.
            const metaChips: EntityCardChip[] = [
              {
                label: HelperFunctions.formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.isCurrentlyWorking,
                ),
                variant: "soft",
                icon: <CalendarMonth />,
              },
            ];
            if (exp.isCurrentlyWorking)
              metaChips.push({ label: "Current", color: "primary" });
            if (exp.projects && exp.projects.length > 0)
              metaChips.push({
                label: `${exp.projects.length} Project${exp.projects.length !== 1 ? "s" : ""}`,
                variant: "soft",
                icon: <FolderOutlined />,
              });

            const techChips: EntityCardChip[] = (
              exp.technologiesUsed || []
            ).map((tech) => ({
              label: tech,
              color: "primary" as const,
              variant: "soft" as const,
            }));

            return (
              <Grid key={exp._id}>
                <EntityCard
                  title={HelperFunctions.capitalizeString(exp.role)}
                  subtitle={HelperFunctions.capitalizeString(exp.companyName)}
                  avatar={<Work />}
                  metaChips={metaChips}
                  chips={techChips}
                  chipsLabel={techChips.length > 0 ? "Tech stack" : undefined}
                  actions={[
                    {
                      label: "Edit",
                      icon: <Edit fontSize="small" />,
                      onClick: () => handleEdit(exp),
                    },
                    {
                      label: "Delete",
                      icon: <Delete fontSize="small" />,
                      color: "error",
                      dividerBefore: true,
                      onClick: () => handleDelete(exp),
                    },
                  ]}
                >
                  {exp.roleDescription && (
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        "& p": { margin: 0 },
                        "& ol, & ul": { marginLeft: "1.5rem" },
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.roleDescription }}
                    />
                  )}
                </EntityCard>
              </Grid>
            );
          })}
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
