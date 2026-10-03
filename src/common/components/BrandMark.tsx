/**
 * BrandMark — the shared Profile Manager identity mark.
 *
 * A single reusable brand lockup (the `Logo` mark + product name) so the
 * identity is defined once and reused everywhere it appears (auth aside,
 * header, sidebar, footer). Presentational only — wrap it in a router link if
 * you need navigation.
 *
 * `variant="onBrand"` renders the mark white for placement over the teal brand
 * surface; `"default"` paints it in the brand gradient for neutral backgrounds.
 */

import { Stack, Typography } from "@mui/material";
import { APP_NAME } from "@/constants";
import { Logo } from "./Logo";

export interface BrandMarkProps {
  /** Colour treatment: neutral surface ("default") vs teal brand surface ("onBrand"). */
  variant?: "default" | "onBrand";
  /** Hide the product name and show just the mark. */
  showName?: boolean;
  /** Mark size in px (the name scales with the layout, not this). */
  size?: number;
}

export const BrandMark = ({
  variant = "default",
  showName = true,
  size = 40,
}: BrandMarkProps) => {
  const onBrand = variant === "onBrand";

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      // `mono` inherits this colour, so the mark reads white over the brand
      // gradient and brand-teal everywhere else.
      sx={{ color: onBrand ? "#ffffff" : undefined }}
    >
      <Logo
        size={size}
        tone={onBrand ? "mono" : "brand"}
        title={showName ? undefined : APP_NAME}
      />

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
