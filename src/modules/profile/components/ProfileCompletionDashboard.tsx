/**
 * ProfileCompletionDashboard Component
 * Displays profile completion percentage with circular progress bar.
 * Clicking the progress ring or the "Details" button opens a side panel
 * (MUI Drawer) showing completed and missing sections.
 *
 * All drawer colors use MUI theme tokens — fully compatible with
 * both light (#ffffff paper) and dark (#1e1e1e paper) themes.
 */

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  ListItemButton,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Refresh,
  ArrowForwardIos,
} from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type ProfileCompletion,
} from "../services/profileService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { SectionCard } from "@/common/components/SectionCard";

const SECTION_LABELS: Record<
  string,
  { label: string; color: string; key: string; path: string }
> = {
  personalDetails: {
    label: "Personal Details",
    color: "#1976d2",
    key: "personalDetails",
    path: ROUTES.PERSONAL_DETAILS,
  },
  contactDetails: {
    label: "Contact Details",
    color: "#d32f2f",
    key: "contactDetails",
    path: ROUTES.CONTACT,
  },
  education: {
    label: "Education",
    color: "#388e3c",
    key: "education",
    path: ROUTES.EDUCATION,
  },
  experience: {
    label: "Experience",
    color: "#f57c00",
    key: "experience",
    path: ROUTES.EXPERIENCE,
  },
  projects: {
    label: "Projects",
    color: "#7b1fa2",
    key: "projects",
    path: ROUTES.PROJECTS,
  },
  skills: {
    label: "Skills",
    color: "#00796b",
    key: "skills",
    path: ROUTES.SKILLS,
  },
  portfolio: {
    label: "Portfolio",
    color: "#c2185b",
    key: "portfolio",
    path: ROUTES.PORTFOLIO,
  },
  profileImage: {
    label: "Profile Image",
    color: "#0288d1",
    key: "personalDetails",
    path: ROUTES.PERSONAL_DETAILS,
  },
  resume: {
    label: "Resume",
    color: "#5e35b1",
    key: "personalDetails",
    path: ROUTES.PERSONAL_DETAILS,
  },
};

const ALL_SECTIONS = Object.values(SECTION_LABELS);

interface ProfileCompletionData extends ProfileCompletion {
  isLoading?: boolean;
}

export const ProfileCompletionDashboard = ({
  onSectionClick,
}: {
  onSectionClick?: (section: string) => void;
}) => {
  const { showError } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const [completion, setCompletion] = useState<ProfileCompletionData>({
    percentage: 0,
    completedSections: [],
    missingSections: [],
    lastCalculatedAt: new Date(),
    isLoading: true,
  });

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      setCompletion((prev) => ({ ...prev, isLoading: true }));
      const response = await profileService.getProfileCompletion();
      const remainingSection = ALL_SECTIONS.filter(
        (section) =>
          !response.profileCompletion.completedSections.includes(section.label),
      ).map((section) => ({ label: section.label, key: section.key }));

      setCompletion({
        ...response.profileCompletion,
        missingSections: remainingSection,
        isLoading: false,
      });
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to fetch profile completion",
      );
      setCompletion((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getMotivationalMessage = (): { text: string; icon: string } => {
    const { percentage } = completion;
    if (percentage === 0)
      return { text: "Let's start building your profile!", icon: "🚀" };
    if (percentage <= 30)
      return { text: "You're off to a great start!", icon: "✨" };
    if (percentage <= 70)
      return { text: "You're making great progress!", icon: "💪" };
    if (percentage < 100)
      return {
        text: "Almost there! Complete the remaining sections.",
        icon: "🎯",
      };
    return { text: "Your profile is fully complete! 🎉", icon: "👏" };
  };

  const motivationalMsg = getMotivationalMessage();

  // ── Theme-aware color tokens ──────────────────────────────────────────────
  // Success (green) — used for completed sections
  const successMain = theme.palette.success.main; // #2e7d32
  const successBg = alpha(successMain, isDark ? 0.15 : 0.08);
  const successBorder = alpha(successMain, isDark ? 0.35 : 0.2);
  // const successChipBg = alpha(successMain, isDark ? 0.25 : 0.14);
  const progressGreen = "#4caf50";

  // Warning (orange) — used for missing sections
  const warningMain = theme.palette.warning.main; // #ed6c02
  const warningBg = alpha(warningMain, isDark ? 0.15 : 0.08);
  const warningBorder = alpha(warningMain, isDark ? 0.35 : 0.2);
  // const warningChipBg = alpha(warningMain, isDark ? 0.25 : 0.14);

  // Recap banner — subtle tinted surface
  // const recapBg = alpha(progressGreen, isDark ? 0.12 : 0.07);
  // const recapBorder = alpha(progressGreen, isDark ? 0.3 : 0.2);

  // Ring inner circle — must match paper background
  const ringInnerBg = theme.palette.background.paper;

  // Track color for linear progress
  const trackColor = isDark ? alpha("#ffffff", 0.12) : "#e0e0e0";

  const CompletedSectionsCard = () => (
    <SectionCard
      title="Completed"
      count={completion.completedSections.length}
      icon={<CheckCircle sx={{ color: successMain }} />}
      chipColor="success"
      items={completion.completedSections}
      renderItem={(section) => (
        <ListItem
          key={section}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: successBg,
            border: `1px solid ${successBorder}`,
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CheckCircle sx={{ color: successMain }} />
          </ListItemIcon>

          <ListItemText
            primary={SECTION_LABELS[section]?.label || section}
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "0.92rem",
            }}
          />

          <Chip
            label="Done"
            size="small"
            color="success"
            variant="outlined"
            sx={{
              fontWeight: 600,
              minWidth: 60,
            }}
          />
        </ListItem>
      )}
    />
  );

  const handleNavigateToPage = (section: string) => {
    const page = SECTION_LABELS[section]?.path;
    if (page) {
      navigate(page);
    }
  };

  const MissingSectionsCard = () => (
    <SectionCard
      title="To Complete"
      count={completion?.missingSections?.length ?? 0}
      icon={<RadioButtonUnchecked sx={{ color: warningMain }} />}
      chipColor="warning"
      items={completion?.missingSections ?? []}
      renderItem={(section) => (
        <ListItemButton
          key={section.key}
          onClick={() => {
            onSectionClick?.(section.key);
            handleNavigateToPage(section.key);
          }}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: warningBg,
            border: `1px solid ${warningBorder}`,
            "&:hover": {
              bgcolor: alpha(warningMain, isDark ? 0.22 : 0.12),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <RadioButtonUnchecked sx={{ color: warningMain }} />
          </ListItemIcon>

          <ListItemText
            primary={SECTION_LABELS[section.key]?.label || section.label}
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "0.92rem",
            }}
          />

          <ArrowForwardIos
            sx={{
              fontSize: 16,
              color: warningMain,
            }}
          />
        </ListItemButton>
      )}
    />
  );

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Profile Completion Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Track your profile progress and find the sections you need to
            complete
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh status">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchProfileCompletion}
              disabled={completion.isLoading}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <Card sx={{ width: "100%", mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {/* Clickable Circular Progress Ring */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: `conic-gradient(${progressGreen} 0deg ${completion.percentage * 3.6}deg, ${trackColor} ${completion.percentage * 3.6}deg 360deg)`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.04)",
                  boxShadow: `0 4px 16px ${alpha(progressGreen, 0.35)}`,
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  background: ringInnerBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: progressGreen }}
                >
                  {completion.percentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Complete
                </Typography>
              </Box>
            </Box>

            {/* Motivational text + linear bar */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontSize: "24px" }}>
                  {motivationalMsg.icon}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {motivationalMsg.text}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {completion.completedSections.length} of {ALL_SECTIONS.length}{" "}
                sections completed
              </Typography>

              <LinearProgress
                variant="determinate"
                value={completion.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: trackColor,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    backgroundColor: progressGreen,
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box
        id="section-details"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Section Details
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {completion.completedSections.length} of {ALL_SECTIONS.length}{" "}
            completed
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchProfileCompletion}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
        {/* Mini progress recap */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: recapBg,
            border: `1px solid ${recapBorder}`,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `conic-gradient(${progressGreen} 0deg ${completion.percentage * 3.6}deg, ${trackColor} ${completion.percentage * 3.6}deg 360deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: ringInnerBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: progressGreen,
                  fontSize: "13px",
                }}
              >
                {completion.percentage}%
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {motivationalMsg.icon} {motivationalMsg.text}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={completion.percentage}
              sx={{
                mt: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: trackColor,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  backgroundColor: progressGreen,
                },
              }}
            />
          </Box>
        </Box> */}

        {/* Cards */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <Card sx={{ flex: 1 }}>
            <MissingSectionsCard />
          </Card>

          <Card sx={{ flex: 1 }}>
            <CompletedSectionsCard />
          </Card>
        </Stack>
      </Box>
    </>
  );
};
