/**
 * EntityCard Component
 * Generic, hover-interactive content card used across listing pages.
 * Composes an optional avatar, title + chip, a meta-chip row (dates / status /
 * counts), info rows, a custom body (children), tag chips, an optional pinned
 * footer, and a top-right 3-dot ActionMenu.
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

/**
 * `soft` is the design system's calm tone: a tinted fill with coloured text and
 * no border. It keeps dense chip rows readable instead of turning them into a
 * row of competing outlines.
 */
type ChipVariant = "filled" | "outlined" | "soft";

export type EntityCardChip = {
  label: string;
  color?: ChipColor;
  variant?: ChipVariant;
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
  /** Chip shown beside the title (role/level/type). */
  headerChip?: EntityCardChip;
  /**
   * Facts about the entity — dates, status, counts. Rendered as their own row
   * directly under the header so they never wrap in with the tag chips.
   */
  metaChips?: EntityCardChip[];
  /** Icon + text rows. */
  info?: EntityCardInfo[];
  /** Tag chips row (rendered after the body). */
  chips?: EntityCardChip[];
  /** Small overline label above the tag chips row (e.g. "Technologies"). */
  chipsLabel?: string;
  /** 3-dot action menu items. */
  actions?: ActionMenuItem[];
  /** Custom top-right element (used instead of `actions`). */
  headerAction?: ReactNode;
  /** Pinned to the bottom of the card below a divider (links, view action). */
  footer?: ReactNode;
  /** Makes the whole card clickable. */
  onClick?: () => void;
  /** Custom body content, rendered between the header and info/chips. */
  children?: ReactNode;
};

const renderChip = (chip: EntityCardChip, key: React.Key) => {
  const color = chip.color ?? "default";
  const variant = chip.variant ?? "filled";

  if (variant !== "soft") {
    return (
      <Chip
        key={key}
        label={chip.label}
        icon={chip.icon as any}
        size="small"
        color={color}
        variant={variant}
      />
    );
  }

  return (
    <Chip
      key={key}
      label={chip.label}
      icon={chip.icon as any}
      size="small"
      variant="filled"
      sx={(theme) => {
        const tone =
          color === "default"
            ? theme.palette.text.secondary
            : theme.palette[color].main;
        return {
          bgcolor: alpha(tone, theme.palette.mode === "dark" ? 0.18 : 0.12),
          color: tone,
          border: "none",
          "& .MuiChip-icon": { color: "inherit", fontSize: 15, ml: 0.75 },
        };
      }}
    />
  );
};

const chipRow = (items: EntityCardChip[], mt: number) => (
  <Box
    sx={{
      mt,
      display: "flex",
      gap: 0.75,
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    {items.map((chip, idx) => renderChip(chip, idx))}
  </Box>
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
  metaChips,
  info,
  chips,
  chipsLabel,
  actions,
  headerAction,
  footer,
  onClick,
  children,
}: EntityCardProps) => {
  const clickable = Boolean(onClick);
  const hasAvatar = Boolean(avatar || avatarText);
  const isFilled = avatarVariant === "filled";

  return (
    <Card
      onClick={onClick}
      // Only clickable entity cards get the interactive hover lift; static
      // ones (no onClick) stay flat. See the MuiCard theme override.
      data-interactive={clickable ? "true" : undefined}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
            {/* Title and its qualifier chip share a line — the chip labels the
                title, so stacking it on its own row just wastes height. */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                noWrap
                title={
                  titleTooltip ?? (typeof title === "string" ? title : undefined)
                }
                sx={{ minWidth: 0 }}
              >
                {title}
              </Typography>
              {headerChip && renderChip(headerChip, "header-chip")}
            </Box>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ mt: 0.25 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions && actions.length > 0 ? (
            <ActionMenu items={actions} tooltip="Actions" />
          ) : (
            headerAction
          )}
        </Box>

        {metaChips && metaChips.length > 0 && chipRow(metaChips, 1.5)}

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
          <Box sx={{ mt: 2 }}>
            {chipsLabel && (
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mb: 0.75, lineHeight: 1 }}
              >
                {chipsLabel}
              </Typography>
            )}
            {chipRow(chips, 0)}
          </Box>
        )}
      </CardContent>

      {footer && (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
};
