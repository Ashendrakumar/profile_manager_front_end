/**
 * Footer Component
 * Application footer
 */

import { Box, Container, Typography } from "@mui/material";

interface FooterProps {
  show: boolean;
}

/**
 * Footer Component
 */
export const Footer = ({ show }: FooterProps) => {
  if (!show) {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Profile Manager. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
