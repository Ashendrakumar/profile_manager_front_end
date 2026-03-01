/**
 * Body Component
 * Main content area with scrollable container
 */

import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';

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
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container
        component="main"
        sx={{
          flex: 1,
          py: isAuthPage ? 0 : 2,
          maxWidth: isAuthPage ? '100%' : undefined,
          px: isAuthPage ? 0 : undefined,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

