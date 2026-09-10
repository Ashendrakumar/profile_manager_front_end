/**
 * BrandMark — the shared Profile Manager identity mark.
 *
 * A single reusable brand lockup (rounded logo tile + product name) so the
 * "P + Profile Manager" identity is defined once and reused everywhere it
 * appears (auth aside, header, sidebar). Presentational only — wrap it in a
 * router link if you need navigation.
 *
 * `variant="onBrand"` renders white-on-transparent for placement over the teal
 * brand surface; `"default"` uses theme tokens for neutral backgrounds.
 */

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { APP_NAME } from "@/constants";

export interface BrandMarkProps {
  /** Color treatment: neutral surface ("default") vs teal brand surface ("onBrand"). */
  variant?: "default" | "onBrand";
  /** Hide the product name and show just the logo tile. */
  showName?: boolean;
  /** Logo tile size in px (name scales with the layout, not this). */
  size?: number;
}

export const BrandMark = ({
  variant = "default",
  showName = true,
  size = 40,
}: BrandMarkProps) => {
  const theme = useTheme();
  const onBrand = variant === "onBrand";

  const tileColor = onBrand ? "#ffffff" : theme.palette.primary.main;
  const tileBg = onBrand
    ? alpha("#ffffff", 0.18)
    : alpha(theme.palette.primary.main, 0.1);
  const tileBorder = onBrand
    ? alpha("#ffffff", 0.28)
    : alpha(theme.palette.primary.main, 0.2);

  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          borderRadius: `${Math.round(size * 0.3)}px`,
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: size * 0.46,
          lineHeight: 1,
          color: tileColor,
          background: tileBg,
          border: `1px solid ${tileBorder}`,
        }}
      >
        P
      </Box>

      {showName && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: onBrand ? "#ffffff" : "text.primary",
          }}
        >
          {APP_NAME}
        </Typography>
      )}
    </Stack>
  );
};
