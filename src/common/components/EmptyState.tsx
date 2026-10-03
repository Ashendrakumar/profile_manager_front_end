/**
 * EmptyState — the shared "nothing here yet" placeholder.
 *
 * A dashed "add" tile per the design system: an optional icon medallion, a
 * title, a short prompt, and either a clickable tile (`onClick`) or an explicit
 * `action` button. Used on list/manage screens when there are no items.
 */

import type { ReactNode } from "react";
import { Box, Typography, alpha } from "@mui/material";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Makes the whole dashed tile clickable (e.g. open the add form). */
  onClick?: () => void;
  /** Explicit action element rendered under the prompt. */
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, onClick, action }: EmptyStateProps) => (
  <Box
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1.5,
      py: 7,
      px: 3,
      borderRadius: 4,
      border: "1.5px dashed",
      borderColor: "divider",
      color: "text.secondary",
      cursor: onClick ? "pointer" : "default",
      transition: (t) => t.transitions.create(["border-color", "background-color"]),
      ...(onClick && {
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        },
      }),
    }}
  >
    {icon && (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
        }}
      >
        {icon}
      </Box>
    )}
    <Typography variant="h6" color="text.primary">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
);
