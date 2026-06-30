/**
 * AboutPage Component
 * Dynamic About page that fetches content from the server
 */

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  Container,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { useAuth } from "@/contexts";
import { aboutService, type AboutData } from "../services/aboutService";

/**
 * About page component
 */
const AboutPage = () => {
  // Set page metadata
  useMetadata({
    title: "About Us - Profile Manager",
    description: "Learn more about Profile Manager and our mission",
    keywords: "about, information, company",
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aboutService.getAbout();
      setAboutData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load About content. Please try again later.",
      );
      console.error("Error fetching About content:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h3" component="h1">
          {aboutData?.title || "About Profile Manager"}
        </Typography>

        {/* Edit button for admins */}
        {user?.role === "admin" && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate("/admin/about")}
            sx={{ ml: 2 }}
          >
            Edit
          </Button>
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {aboutData ? (
        <>
          {/* Main Description */}
          <Card sx={{ mt: 4, mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {aboutData.title}
              </Typography>
              <Box
                sx={{
                  "& p": { mb: 1 },
                  "& ul": { mb: 1 },
                  "& li": { mb: 0.5 },
                }}
                dangerouslySetInnerHTML={{
                  __html: aboutData.description,
                }}
              />
            </CardContent>
          </Card>

          {/* Features Grid */}
          {aboutData.features && aboutData.features.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Key Features
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {aboutData.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "0.3s",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Box
                          sx={{
                            "& p": { mb: 0.5 },
                            "& ul": { mb: 0.5, pl: 2 },
                            "& li": { mb: 0.25 },
                            "& strong": { fontWeight: "bold" },
                            "& em": { fontStyle: "italic" },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: feature.description,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* No content message */}
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>
          No About content available yet. Please check back later.
        </Alert>
      )}
    </>
  );
};

export default AboutPage;
