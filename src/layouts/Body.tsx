/**
 * Body Component
 * Main content area with scrollable container
 */

import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { DIMENSIONS } from "@/constants";

interface BodyProps {
  children: ReactNode;
  open: boolean;
  isCollapsed: boolean;
}
/**
 * Body Component
 * Scrollable content area
 */
export const Body = ({ open, children, isCollapsed }: BodyProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          my: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          ml: {
            xs: 0,
            md: open
              ? DIMENSIONS.SIDE_BAR_WIDTH
              : isCollapsed
                ? DIMENSIONS.SIDE_BAR_WIDTH_ICON
                : 0,
          },
          transition: "margin 0.3s ease",
        }}
        id="main-content"
      >
        {children}
      </Box>
      <Footer show />
    </Box>
  );
};
