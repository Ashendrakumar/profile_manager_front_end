/**
 * Body Component
 * Main content area with scrollable container
 */

import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface BodyProps {
  children: ReactNode;
  isAuthPage: boolean;
}

/**
 * Body Component
 * Scrollable content area
 */
export const Body = ({ children, isAuthPage }: BodyProps) => {
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
          py: isAuthPage ? 0 : 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
