/**
 * SkillsSection Component
 * Manages skills (CRUD)
 */

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Add, Edit, Delete, Code } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { profileService, type Skill } from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  SectionCard,
  ResponsiveButton,
  PageHeader,
  EmptyState,
} from "@/common/components";
import { SkillForm } from "./SkillForm";
import { SkillTile } from "./SkillTile";
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

  // Group skills by category, then order the categories by size so the
  // strongest areas lead the page.
  const groupedSkills = Object.entries(
    skills.reduce(
      (acc, skill) => {
        const category = (skill.category || "Other").toLowerCase();
        (acc[category] ||= []).push(skill);
        return acc;
      },
      {} as Record<string, Skill[]>,
    ),
  ).sort(([, a], [, b]) => b.length - a.length);

  return (
    <Box>
      <PageHeader
        title="Skills"
        subtitle="Manage your skills and expertise"
        count={skills.length}
        action={
          <ResponsiveButton collapseBreakpoint="sm" icon={<Add />} onClick={handleAdd}>
            Add Skill
          </ResponsiveButton>
        }
      />

      {loading ? (
        <SkeletonLoader
          variant="grouped"
          count={2}
          itemsPerGroup={8}
          minItemWidth={190}
          gap={3}
        />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={<Code />}
          title="No skills yet"
          description="Add the skills and technologies you work with, grouped by category."
          onClick={handleAdd}
        />
      ) : (
        // One card per category; the tiles inside are dense enough that a
        // category of 12 skills costs roughly the height a single old card did.
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          {groupedSkills.map(([category, categorySkills]) => (
            <SectionCard
              key={category}
              title={HelperFunctions.capitalizeString(category)}
              count={categorySkills.length}
              icon={<Code color="primary" />}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: 1.5,
                }}
              >
                {categorySkills.map((skill) => (
                  <SkillTile
                    key={skill._id}
                    skill={skill}
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
                ))}
              </Box>
            </SectionCard>
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
