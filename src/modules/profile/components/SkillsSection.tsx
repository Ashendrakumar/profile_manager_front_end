/**
 * SkillsSection Component
 * Manages skills (CRUD)
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
import { profileService, type Skill } from "../services/profileService";
import { LoadingSpinner } from "@/common/components";
import { ConfirmDialog } from "@/common/components";
import { SkillForm } from "./SkillForm";
import { HelperFunctions } from "@/utils/helpers";

export const SkillsSection = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
            Skills
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your skills and expertise
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Skill
        </Button>
      </Box>

      {skills.length === 0 ? (
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
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6">{skill.name}</Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => handleEdit(skill)}
                              color="primary"
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(skill)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box>
                            <Chip
                              label={skill.level}
                              variant="outlined"
                              size="medium"
                              color={getLevelColor(skill.level)}
                            />
                          </Box>
                          {skill.yearsOfExperience !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              {skill.yearsOfExperience} years of experience
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
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
