/**
 * NotFoundPage Component
 * 404 Not Found page
 */

import { Typography, Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { ROUTES } from "@/constants";

/**
 * 404 Not Found page component
 */
const Inprogress = () => {
  const navigate = useNavigate();

  // Set page metadata
  useMetadata({
    title: "Inprogress - Team is Working on it",
    description: "The page you are looking for is Inprogress or Working on it",
  });

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="calc(100dvh - var(--header-height) - var(--footer-height))"
        textAlign="center"
      >
        <Typography variant="h1" component="h1" gutterBottom>
          In-Progress
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Under Development
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Page you are looking for is Under Development
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(ROUTES.PROFILE_COMPLETION)}
          sx={{ mt: 2 }}
        >
          Go to Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Inprogress;
