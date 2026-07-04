/**
 * SkillsSection Component
 * Manages skills (CRUD)
 */

import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Add, Edit, Delete, Code, AccessTime } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Skill } from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  EntityCard,
  ResponsiveButton,
} from "@/common/components";
import { SkillForm } from "./SkillForm";
import { HelperFunctions } from "@/utils/helpers";

export const SkillsSection = () => {
  const { showSuccess, showError } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await profileService.getSkills();
      setSkills(response.skills);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSkill(null);
    setFormOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormOpen(true);
  };

  const handleDelete = (skill: Skill) => {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);
      if (selectedSkill?._id) {
        await profileService.updateSkill(selectedSkill._id, data);
        showSuccess("Skill updated successfully");
      } else {
        await profileService.addSkill(data);
        showSuccess("Skill added successfully");
      }
      setFormOpen(false);
      setSelectedSkill(null);
      await fetchSkills();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save skill");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete?._id) return;

    try {
      setActionLoading(true);
      await profileService.deleteSkill(skillToDelete._id);
      showSuccess("Skill deleted successfully");
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
      await fetchSkills();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete skill");
    } finally {
      setActionLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "primary";
      case "INTERMEDIATE":
        return "info";
      case "ADVANCED":
        return "warning";
      case "EXPERT":
        return "success";
      default:
        return "primary";
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = (skill.category || "Other").toLowerCase();
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

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
            Skills
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your skills and expertise
          </Typography>
        </Box>
        <ResponsiveButton
          collapseBreakpoint="sm"
          icon={<Add />}
          onClick={handleAdd}
        >
          Add
        </ResponsiveButton>
      </Box>

      {loading && (
        <SkeletonLoader
          count={6}
          minItemWidth={320}
          gap={2}
          showActions={false}
        />
      )}

      {skills.length === 0 && !loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No skills yet. Add your first one!
          </Typography>
        </Box>
      ) : (
        <Box>
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {HelperFunctions.capitalizeString(category)}
              </Typography>
              <Grid
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 2,
                }}
              >
                {categorySkills.map((skill) => (
                  <Grid item xs={12} sm={6} md={4} key={skill._id}>
                    <EntityCard
                      title={skill.name}
                      avatar={<Code />}
                      headerChip={{
                        label: skill.level,
                        color: getLevelColor(skill.level),
                        variant: "outlined",
                      }}
                      info={
                        skill.yearsOfExperience !== undefined
                          ? [
                              {
                                icon: <AccessTime fontSize="small" />,
                                text: `${skill.yearsOfExperience} years of experience`,
                              },
                            ]
                          : undefined
                      }
                      actions={[
                        {
                          label: "Edit",
                          icon: <Edit fontSize="small" />,
                          onClick: () => handleEdit(skill),
                        },
                        {
                          label: "Delete",
                          icon: <Delete fontSize="small" />,
                          color: "error",
                          dividerBefore: true,
                          onClick: () => handleDelete(skill),
                        },
                      ]}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      <SkillForm
        open={formOpen}
        skill={selectedSkill}
        onClose={() => {
          setFormOpen(false);
          setSelectedSkill(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Skill"
        message={`Are you sure you want to delete "${skillToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSkillToDelete(null);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};
