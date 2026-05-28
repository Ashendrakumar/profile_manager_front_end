/**
 * Admin About Panel Component
 * Admin interface for managing About page content
 */

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Typography,
  Stack,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Save, Edit, Delete, Add, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/toastContext";
import { aboutService, type Feature } from "../services/aboutService";
import TextEditor from "@/common/components/TextEditor";

interface FormData {
  title: string;
  description: string;
  features: Feature[];
  isPublished: boolean;
}

/**
 * Admin About Panel Component
 */
const AdminAboutPanel = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "About Our Project",
    description: "",
    features: [],
    isPublished: true,
  });
  const [newFeature, setNewFeature] = useState({ title: "", description: "" });
  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const data = await aboutService.getAboutForAdmin();
      setAboutId(data._id || null);
      setFormData({
        title: data.title,
        description: data.description,
        features: data.features || [],
        isPublished: data.isPublished ?? true,
      });
    } catch (err) {
      // It's okay if About doesn't exist yet (404)
      console.log("About content not found, ready to create new");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isPublished" ? value === "true" : value,
    }));
  };

  const handleAddFeature = () => {
    if (!newFeature.title || !newFeature.description) {
      showError("Please fill in both feature title and description");
      return;
    }

    if (editingFeatureIndex !== null) {
      // Update existing feature
      const updatedFeatures = [...formData.features];
      updatedFeatures[editingFeatureIndex] = newFeature;
      setFormData((prev) => ({
        ...prev,
        features: updatedFeatures,
      }));
      setEditingFeatureIndex(null);
    } else {
      // Add new feature
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature],
      }));
    }

    setNewFeature({ title: "", description: "" });
    setOpenFeatureDialog(false);
  };

  const handleEditFeature = (index: number) => {
    setNewFeature(formData.features[index]);
    setEditingFeatureIndex(index);
    setOpenFeatureDialog(true);
  };

  const handleDeleteFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      showError("Description is required");
      return;
    }

    try {
      setSaving(true);

      if (aboutId) {
        // Update existing
        await aboutService.updateAbout(aboutId, formData);
        showSuccess("About content updated successfully");
      } else {
        // Create new
        const result = await aboutService.createAbout(formData);
        setAboutId(result._id || null);
        showSuccess("About content created successfully");
      }

      // Redirect to public About page
      navigate("/about");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save About content",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/about")}
          sx={{ mb: 2 }}
        >
          Back to About
        </Button>
        <Typography variant="h4" gutterBottom>
          Manage About Content
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Description Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Page Content
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Page Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter the About page title"
                  />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <TextEditor
                      value={formData.description}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                      placeholder="Enter the About page description"
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      You can use formatting tools in the editor to style your
                      content
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Publish Status
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant={
                          formData.isPublished ? "contained" : "outlined"
                        }
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            isPublished: true,
                          }))
                        }
                      >
                        Published
                      </Button>
                      <Button
                        variant={
                          !formData.isPublished ? "contained" : "outlined"
                        }
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            isPublished: false,
                          }))
                        }
                      >
                        Draft
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Features</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setNewFeature({ title: "", description: "" });
                      setEditingFeatureIndex(null);
                      setOpenFeatureDialog(true);
                    }}
                    size="small"
                  >
                    Add Feature
                  </Button>
                </Box>

                {formData.features.length === 0 ? (
                  <Alert severity="info">No features added yet</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {formData.features.map((feature, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardContent sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ wordBreak: "break-word" }}
                            >
                              {feature.title}
                            </Typography>
                            <Box
                              sx={{
                                "& p": { mb: 0.5 },
                                "& ul": { mb: 0.5, pl: 2 },
                                "& li": { mb: 0.25 },
                                "& strong": { fontWeight: "bold" },
                                "& em": { fontStyle: "italic" },
                                wordBreak: "break-word",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: feature.description,
                              }}
                            />
                          </CardContent>
                          <Box
                            sx={{
                              p: 1,
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                              borderTop: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleEditFeature(index)}
                              color="primary"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteFeature(index)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outlined" onClick={() => navigate("/about")}>
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Feature Dialog */}
      <Dialog
        open={openFeatureDialog}
        onClose={() => {
          setOpenFeatureDialog(false);
          setEditingFeatureIndex(null);
          setNewFeature({ title: "", description: "" });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingFeatureIndex !== null ? "Edit Feature" : "Add Feature"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Feature Title"
              value={newFeature.title}
              onChange={(e) =>
                setNewFeature((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Enter feature title"
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Feature Description
              </Typography>
              <TextEditor
                isNormalField
                value={newFeature.description}
                onChange={(value) =>
                  setNewFeature((prev) => ({
                    ...prev,
                    description: value,
                  }))
                }
                placeholder="Enter feature description"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenFeatureDialog(false);
              setEditingFeatureIndex(null);
              setNewFeature({ title: "", description: "" });
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddFeature}>
            {editingFeatureIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAboutPanel;
