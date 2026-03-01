/**
 * LoadingSpinner Component
 * Reusable loading spinner component
 */

import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

/**
 * Loading spinner component
 * @param size - Size of the spinner (default: 40)
 * @param fullScreen - Whether to display full screen (default: false)
 */
export const LoadingSpinner = ({ size = 40, fullScreen = false }: LoadingSpinnerProps) => {
  const spinner = (
    <CircularProgress size={size} />
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        {spinner}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
    >
      {spinner}
    </Box>
  );
};
