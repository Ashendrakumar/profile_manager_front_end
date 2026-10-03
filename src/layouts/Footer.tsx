/**
 * Footer Component
 *
 * The app shell's closing band, built to the design system: a paper surface
 * separated by a hairline divider (no grey slab), the brand lockup with the
 * copyright on the left and quiet secondary links on the right. Stacks and
 * centres on mobile.
 */

import { Box, Link, Stack, Typography } from "@mui/material";
import { BrandMark } from "@/common/components";
import { APP_NAME } from "@/constants";

interface FooterProps {
  show: boolean;
}

const LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Support", href: "#" },
];

export const Footer = ({ show }: FooterProps) => {
  if (!show) {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.5 }}
          alignItems="center"
        >
          <BrandMark size={28} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2.5} alignItems="center">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              underline="none"
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                transition: (theme) => theme.transitions.create("color"),
                "&:hover": { color: "primary.main" },
              }}
            >
              {link.label}
            </Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
