/**
 * StatCard — dashboard KPI tile (icon + value + label + optional delta).
 *
 * Module-scoped for the Dashboard. Uses theme tokens only (works in light/dark).
 * Promote to `common/components` if it gets reused on other screens.
 */

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Accent used for the icon tile (defaults to primary). */
  color?: string;
  /** Optional trend line under the value. */
  delta?: { label: string; positive?: boolean };
  loading?: boolean;
}

export const StatCard = ({
  icon,
  label,
  value,
  color,
  delta,
  loading = false,
}: StatCardProps) => {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            mb: 1.5,
            color: accent,
            bgcolor: alpha(accent, theme.palette.mode === "dark" ? 0.22 : 0.14),
          }}
        >
          {icon}
        </Box>

        {loading ? (
          <>
            <Skeleton variant="text" width="55%" height={36} />
            <Skeleton variant="text" width="75%" />
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {label}
            </Typography>
            {delta && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: "block",
                  fontWeight: 700,
                  color: delta.positive ? "success.main" : "error.main",
                }}
              >
                {delta.positive ? "▲" : "▼"} {delta.label}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
