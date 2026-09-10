/**
 * PageHeader — the shared screen header.
 *
 * Title (h4) + optional count chip + optional subtitle on the left, and an
 * action slot (usually a primary button or a search + button) on the right.
 * Wraps cleanly on mobile. Use on every list/manage screen so headers share
 * one language.
 */

import type { ReactNode } from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional count chip shown next to the title. */
  count?: number;
  /** Right-aligned actions (button, search, etc.). */
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, count, action }: PageHeaderProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: { xs: "stretch", sm: "flex-end" },
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 2,
      mb: 3,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Typography variant="h4">{title}</Typography>
        {typeof count === "number" && (
          <Chip label={count} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
        )}
      </Stack>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);
