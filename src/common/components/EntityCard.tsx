/**
 * EntityCard Component
 * Generic, hover-interactive content card used across listing pages.
 * Composes an optional avatar, title + chip, info rows, tag chips, a custom
 * body (children), and a top-right 3-dot ActionMenu.
 */

import type { ReactNode } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  alpha,
} from "@mui/material";
import { ActionMenu, type ActionMenuItem } from "./ActionMenu";

type PaletteColor =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type ChipColor = PaletteColor | "default";

export type EntityCardChip = {
  label: string;
  color?: ChipColor;
  variant?: "filled" | "outlined";
  icon?: ReactNode;
};

export type EntityCardInfo = {
  icon?: ReactNode;
  text: ReactNode;
  tooltip?: string;
};

export type EntityCardProps = {
  title: ReactNode;
  titleTooltip?: string;
  subtitle?: ReactNode;
  /** Custom avatar content (e.g. an icon). Falls back to `avatarText`. */
  avatar?: ReactNode;
  /** Single-letter fallback avatar. */
  avatarText?: string;
  avatarVariant?: "filled" | "tinted";
  avatarColor?: PaletteColor;
  /** Chip shown under the title (role/level/type). */
  headerChip?: EntityCardChip;
  /** Icon + text rows. */
  info?: EntityCardInfo[];
  /** Tag chips row (rendered after the body). */
  chips?: EntityCardChip[];
  /** 3-dot action menu items. */
  actions?: ActionMenuItem[];
  /** Custom top-right element (used instead of `actions`). */
  headerAction?: ReactNode;
  /** Makes the whole card clickable. */
  onClick?: () => void;
  /** Custom body content, rendered between the header and info/chips. */
  children?: ReactNode;
};

const renderChip = (chip: EntityCardChip, key: React.Key) => (
  <Chip
    key={key}
    label={chip.label}
    icon={chip.icon as any}
    size="small"
    color={chip.color ?? "default"}
    variant={chip.variant ?? "filled"}
  />
);

export const EntityCard = ({
  title,
  titleTooltip,
  subtitle,
  avatar,
  avatarText,
  avatarVariant = "tinted",
  avatarColor = "primary",
  headerChip,
  info,
  chips,
  actions,
  headerAction,
  onClick,
  children,
}: EntityCardProps) => {
  const clickable = Boolean(onClick);
  const hasAvatar = Boolean(avatar || avatarText);
  const isFilled = avatarVariant === "filled";

  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        cursor: clickable ? "pointer" : "default",
        transition: (theme) =>
          theme.transitions.create(
            ["transform", "box-shadow", "border-color"],
            { duration: theme.transitions.duration.shorter },
          ),
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {hasAvatar && (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                fontWeight: 600,
                bgcolor: (theme) =>
                  isFilled
                    ? theme.palette[avatarColor].main
                    : alpha(theme.palette[avatarColor].main, 0.15),
                color: (theme) =>
                  isFilled
                    ? theme.palette[avatarColor].contrastText
                    : theme.palette[avatarColor].main,
              }}
            >
              {avatar ?? avatarText}
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              title={titleTooltip ?? (typeof title === "string" ? title : undefined)}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
            {headerChip && (
              <Box sx={{ mt: 0.5 }}>
                {renderChip(headerChip, "header-chip")}
              </Box>
            )}
          </Box>

          {actions && actions.length > 0 ? (
            <ActionMenu items={actions} tooltip="Actions" />
          ) : (
            headerAction
          )}
        </Box>

        {children && <Box sx={{ mt: 2 }}>{children}</Box>}

        {info && info.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            {info.map((row, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                  minWidth: 0,
                }}
              >
                {row.icon}
                <Typography
                  variant="body2"
                  noWrap
                  title={
                    row.tooltip ??
                    (typeof row.text === "string" ? row.text : undefined)
                  }
                >
                  {row.text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {chips && chips.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {chips.map((chip, idx) => renderChip(chip, idx))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
