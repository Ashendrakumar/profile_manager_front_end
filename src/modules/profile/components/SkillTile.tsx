/**
 * SkillTile — the compact unit of the Skills page.
 *
 * A skill only carries a name, a level and a year count, so it gets a dense
 * ~76px tile rather than a full EntityCard: name + kebab, the level/years
 * caption, and a slim continuous proficiency bar.
 */

import { Box, LinearProgress, Typography, alpha } from "@mui/material";
import { ActionMenu, type ActionMenuItem } from "@/common/components";
import type { Skill, SkillLevel } from "../services/profileService";

/** How many of the four meter steps each level fills. */
const LEVEL_STEPS: Record<SkillLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

const LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

const TOTAL_STEPS = 4;

export type SkillTileProps = {
  skill: Skill;
  actions: ActionMenuItem[];
};

export const SkillTile = ({ skill, actions }: SkillTileProps) => {
  const steps = LEVEL_STEPS[skill.level] ?? 1;
  const caption = [
    LEVEL_LABEL[skill.level] ?? skill.level,
    skill.yearsOfExperience !== undefined
      ? `${skill.yearsOfExperience} yr${skill.yearsOfExperience === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 1.25,
        border: 1,
        borderColor: "divider",
        // Radius xs (8px) — a 72px tile with the card's 16px radius reads as a
        // lozenge rather than a tile.
        borderRadius: "8px",
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        transition: theme.transitions.create(["border-color", "background"]),
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          noWrap
          title={skill.name}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {skill.name}
        </Typography>
        <ActionMenu
          items={actions}
          tooltip="Actions"
          ariaLabel={`Actions for ${skill.name}`}
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{ display: "block" }}
      >
        {caption}
      </Typography>

      {/* One continuous track — the old four-segment meter read as a broken line. */}
      <LinearProgress
        variant="determinate"
        value={(steps / TOTAL_STEPS) * 100}
        aria-label={`Proficiency ${steps} of ${TOTAL_STEPS}`}
        sx={(theme) => ({
          mt: 1,
          height: 3,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.text.primary, 0.1),
          "& .MuiLinearProgress-bar": { borderRadius: 999 },
        })}
      />
    </Box>
  );
};
