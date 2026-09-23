/**
 * MyProfilePage — the single "My Profile" hub
 *
 * One page combining Profile Completion (progress ring, motivational message,
 * completed / to-complete section lists), Personal Details and Contact Details.
 * Data shows read-only; each section has an Edit button that opens the shared
 * SideDrawer form. Resumes are managed in their own drawer; only the primary
 * resume is surfaced on the page. Completion re-fetches after every save so the
 * ring stays in sync.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit,
  Description,
  Download,
  Person,
  ContactMail,
  ChevronRight,
  CheckCircleRounded,
  RadioButtonUnchecked,
  ErrorOutline,
  Refresh,
} from "@mui/icons-material";
import { useMetadata } from "@/hooks";
import { useToast } from "@/contexts/toastContext";
import { useAuth } from "@/contexts";
import { ROUTES } from "@/constants";
import { HelperFunctions } from "@/utils/helpers";
import { ResponsiveButton } from "@/common/components";
import {
  profileService,
  type PersonalDetails,
  type ContactDetails,
  type ResumeItem,
  type ProfileCompletion,
} from "../services/profileService";
import { PersonalDetailsDrawer } from "../components/PersonalDetailsDrawer";
import { ContactDetailsDrawer } from "../components/ContactDetailsDrawer";
import { ResumeManagerDrawer } from "../components/ResumeManagerDrawer";

// Section key → display label + where clicking should take the user.
// Hash targets scroll to an on-page section; path targets navigate.
const SECTION_META: Record<string, { label: string; target: string }> = {
  personalDetails: { label: "Personal Details", target: "#section-personal" },
  profileImage: { label: "Profile Image", target: "#section-personal" },
  resume: { label: "Resume", target: "#section-personal" },
  contactDetails: { label: "Contact Details", target: "#section-contact" },
  education: { label: "Education", target: ROUTES.EDUCATION },
  experience: { label: "Experience", target: ROUTES.EXPERIENCE },
  projects: { label: "Projects", target: ROUTES.PROJECTS },
  skills: { label: "Skills", target: ROUTES.SKILLS },
  certifications: { label: "Certifications", target: ROUTES.CERTIFICATIONS },
  portfolio: { label: "Portfolio", target: ROUTES.PORTFOLIO },
};

// "personalDetails" → "Personal Details"; passes through readable labels.
const prettySection = (key: string) =>
  SECTION_META[key]?.label ??
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const getMotivation = (pct: number): { text: string; emoji: string } => {
  if (pct >= 100)
    return { text: "Your profile is fully complete!", emoji: "🎉" };
  if (pct === 0)
    return { text: "Let's start building your profile!", emoji: "🚀" };
  if (pct <= 30) return { text: "You're off to a great start!", emoji: "✨" };
  if (pct <= 70) return { text: "You're making great progress!", emoji: "💪" };
  return { text: "Almost there — just a few sections left!", emoji: "🎯" };
};

type DrawerName = "personal" | "contact" | "resume" | null;

// ── Small read-only presentational helpers ───────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Box sx={{ py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", mb: 0.25 }}
    >
      {label}
    </Typography>
    {value ? (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    ) : (
      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
        Not added
      </Typography>
    )}
  </Box>
);

// A titled rail card with a count chip in its header. Static (no hover).
const RailCard = ({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: "todo" | "done";
  children: React.ReactNode;
}) => {
  const color = tone === "todo" ? "warning" : "primary";
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          <Chip label={count} size="small" color={color} sx={{ fontWeight: 700, minWidth: 34 }} />
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

const ViewCard = ({
  id,
  icon,
  title,
  subtitle,
  onEdit,
  children,
}: {
  id?: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <Card id={id} sx={{ scrollMarginTop: 90 }}>
    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <ResponsiveButton icon={<Edit fontSize="small" />} variant="outlined" onClick={onEdit}>
          Edit
        </ResponsiveButton>
      </Box>
      <Divider sx={{ mb: 1 }} />
      {children}
    </CardContent>
  </Card>
);

const MyProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { user } = useAuth();

  const [personal, setPersonal] = useState<PersonalDetails | null>(null);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [drawer, setDrawer] = useState<DrawerName>(null);

  useMetadata({
    title: "My Profile - Profile Manager",
    description: "Your completion, personal details, contact and resume in one place",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [p, c, r, comp] = await Promise.allSettled([
      profileService.getPersonalDetails(),
      profileService.getContactDetails(),
      profileService.getResumes(),
      profileService.getProfileCompletion(),
    ]);

    if (p.status === "fulfilled") setPersonal(p.value.personalDetails);
    if (c.status === "fulfilled") setContact(c.value.contactDetails);
    if (r.status === "fulfilled") setResumes(r.value.resumes ?? []);
    if (comp.status === "fulfilled") setCompletion(comp.value.profileCompletion);

    if ([p, c, r, comp].every((x) => x.status === "rejected")) {
      const msg = "Failed to load your profile";
      setError(msg);
      showError(msg);
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshCompletion = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await profileService.getProfileCompletion();
      setCompletion(res.profileCompletion);
    } catch {
      /* non-fatal — ring keeps its last value */
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const displayName =
    personal?.profileName ||
    [personal?.firstName, personal?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    "Your profile";
  const jobRole = personal?.jobRole || "";
  const initials = HelperFunctions.getInitials(displayName);
  const pct = completion?.percentage ?? 0;
  const completedSections = completion?.completedSections ?? [];
  const missingSections = completion?.missingSections ?? [];
  const completed = completedSections.length;
  const totalSections = completed + missingSections.length;
  const motivation = getMotivation(pct);
  const primaryResume = useMemo(
    () => resumes.find((r) => r.isPrimary) ?? resumes[0],
    [resumes],
  );

  const goNext = (key: string) => {
    const target = SECTION_META[key]?.target;
    if (!target) return;
    if (target.startsWith("#")) {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(target);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box role="status" aria-busy="true" aria-label="Loading your profile">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={180} height={40} />
          <Skeleton variant="text" width={320} />
        </Box>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Summary rail */}
          <Grid item xs={12} md={4} lg={3.5}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Card>
                <CardContent sx={{ textAlign: "center", pt: 3.5, px: 3, pb: 3 }}>
                  <Skeleton variant="circular" width={132} height={132} sx={{ mx: "auto" }} />
                  <Skeleton variant="text" width="60%" height={28} sx={{ mx: "auto", mt: 2.5 }} />
                  <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
                  <Skeleton variant="rounded" width={96} height={24} sx={{ mx: "auto", mt: 1.5, borderRadius: 999 }} />
                  <Skeleton variant="rounded" height={52} sx={{ mt: 2.5, borderRadius: 2 }} />
                  <Skeleton variant="rounded" height={8} sx={{ mt: 2, borderRadius: 4 }} />
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Skeleton variant="text" width="45%" sx={{ mb: 1 }} />
                  {[0, 1, 2].map((i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                      <Skeleton variant="circular" width={18} height={18} />
                      <Skeleton variant="text" sx={{ flex: 1 }} />
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Editable sections */}
          <Grid item xs={12} md={8} lg={8.5}>
            <Stack spacing={3}>
              {[0, 1].map((card) => (
                <Card key={card}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={26} />
                        <Skeleton variant="text" width="55%" />
                      </Box>
                      <Skeleton variant="rounded" width={72} height={36} sx={{ borderRadius: 3 }} />
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container columnSpacing={3}>
                      {[0, 1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Box sx={{ py: 1.25 }}>
                            <Skeleton variant="text" width="35%" height={14} />
                            <Skeleton variant="text" width="75%" />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
        <ErrorOutline sx={{ fontSize: 48, color: "error.main" }} />
        <Typography variant="h6">Couldn't load your profile</Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
        <ResponsiveButton icon={<Refresh />} onClick={load}>
          Try Again
        </ResponsiveButton>
      </Box>
    );
  }

  const ringDeg = pct * 3.6;

  return (
    <>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          Your completion, personal details and contact — all in one place
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Sticky summary rail ── */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Box sx={{ position: { md: "sticky" }, top: 90, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Identity + completion */}
            <Card sx={{ position: "relative" }}>
              <Tooltip title="Refresh completion">
                <IconButton
                  size="small"
                  onClick={refreshCompletion}
                  disabled={refreshing}
                  sx={{ position: "absolute", top: 8, right: 8, color: "text.secondary" }}
                >
                  <Refresh
                    fontSize="small"
                    sx={{
                      animation: refreshing ? "pm-spin 0.8s linear infinite" : "none",
                      "@keyframes pm-spin": { to: { transform: "rotate(360deg)" } },
                    }}
                  />
                </IconButton>
              </Tooltip>
              <CardContent sx={{ textAlign: "center", pt: 3.5, px: 3, pb: 3 }}>
                <Tooltip title="Edit photo & details">
                  <Box
                    onClick={() => setDrawer("personal")}
                    sx={{ position: "relative", width: 132, height: 132, mx: "auto", cursor: "pointer" }}
                  >
                    <Box
                      sx={{
                        width: 132,
                        height: 132,
                        borderRadius: "50%",
                        p: "6px",
                        boxShadow: theme.shadows[3],
                        background: `conic-gradient(${theme.palette.primary.main} ${ringDeg}deg, ${theme.palette.divider} ${ringDeg}deg 360deg)`,
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.03)" },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          bgcolor: "background.paper",
                          p: "5px",
                        }}
                      >
                        <Avatar
                          src={user?.avatarUrl}
                          sx={{ width: "100%", height: "100%", fontSize: 30, fontWeight: 700, bgcolor: "primary.main" }}
                        >
                          {initials}
                        </Avatar>
                      </Box>
                    </Box>
                    {/* Percentage pill on the ring */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        bottom: -8,
                        transform: "translateX(-50%)",
                        px: 1.25,
                        py: 0.25,
                        borderRadius: 999,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1.6,
                        border: "2px solid",
                        borderColor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      {pct}%
                    </Box>
                  </Box>
                </Tooltip>

                <Typography variant="h6" sx={{ mt: 2.5, fontSize: "1.15rem" }}>
                  {displayName}
                </Typography>
                {jobRole && (
                  <Typography variant="body2" color="text.secondary">
                    {jobRole}
                  </Typography>
                )}
                {user?.role && (
                  <Chip
                    label={HelperFunctions.formatRole(user.role)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1.25 }}
                  />
                )}

                {/* Motivational banner */}
                <Box
                  sx={{
                    mt: 2.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textAlign: "left",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    border: "1px solid",
                    borderColor: (t) => alpha(t.palette.primary.main, 0.16),
                  }}
                >
                  <Typography component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
                    {motivation.emoji}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {motivation.text}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, textAlign: "left" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {completed} of {totalSections} sections
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {pct}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </CardContent>
            </Card>

            {/* To complete (missing) */}
            {missingSections.length > 0 && (
              <RailCard title="To complete" count={missingSections.length} tone="todo">
                <Stack spacing={0.5}>
                  {missingSections.map((s) => (
                    <Box
                      key={s.key}
                      onClick={() => goNext(s.key)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1,
                        py: 1,
                        borderRadius: 1.5,
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ErrorOutline sx={{ fontSize: 18, color: "warning.main" }} />
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                        {SECTION_META[s.key]?.label ?? s.label ?? prettySection(s.key)}
                      </Typography>
                      <ChevronRight sx={{ fontSize: 18, color: "text.disabled" }} />
                    </Box>
                  ))}
                </Stack>
              </RailCard>
            )}

            {/* Completed */}
            {completed > 0 && (
              <RailCard title="Completed" count={completed} tone="done">
                <Stack spacing={0.5}>
                  {completedSections.map((key) => (
                    <Box
                      key={key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1,
                        py: 1,
                        borderRadius: 1.5,
                      }}
                    >
                      <CheckCircleRounded sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                        {prettySection(key)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </RailCard>
            )}

            {/* Empty completion fallback */}
            {totalSections === 0 && (
              <RailCard title="Completion" count={0} tone="todo">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                  <RadioButtonUnchecked sx={{ fontSize: 18 }} />
                  <Typography variant="body2">Start adding details to track progress.</Typography>
                </Stack>
              </RailCard>
            )}
          </Box>
        </Grid>

        {/* ── Editable sections ── */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Stack spacing={3}>
            {/* Personal details */}
            <ViewCard
              id="section-personal"
              icon={<Person />}
              title="Personal Details"
              subtitle="Identity, photo & resume"
              onEdit={() => setDrawer("personal")}
            >
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="First name" value={personal?.firstName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Last name" value={personal?.lastName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Profile name" value={personal?.profileName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Job role" value={personal?.jobRole} />
                </Grid>
                <Grid item xs={12}>
                  <InfoRow label="Profile description" value={personal?.profileDescription} />
                </Grid>
              </Grid>

              {/* Resume sub-block (primary only) */}
              <Box sx={{ mt: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Resume
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your primary resume — shown on your profile & portfolio
                    </Typography>
                  </Box>
                  <ResponsiveButton icon={<Edit fontSize="small" />} variant="outlined" onClick={() => setDrawer("resume")}>
                    Edit
                  </ResponsiveButton>
                </Box>

                {primaryResume ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.main",
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.main",
                      }}
                    >
                      <Description fontSize="small" sx={{ color: "common.white" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {primaryResume.fileName}
                        </Typography>
                        <Chip
                          icon={<CheckCircleRounded sx={{ fontSize: 14 }} />}
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{ height: 20 }}
                        />
                      </Stack>
                      {resumes.length > 1 && (
                        <Typography variant="caption" color="text.secondary">
                          +{resumes.length - 1} more · manage in Edit
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        component="a"
                        href={primaryResume.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box
                    onClick={() => setDrawer("resume")}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1.5px dashed",
                      borderColor: "divider",
                      textAlign: "center",
                      cursor: "pointer",
                      color: "text.secondary",
                      "&:hover": { borderColor: "primary.main", color: "primary.main" },
                    }}
                  >
                    <Typography variant="body2">＋ Add your first resume</Typography>
                  </Box>
                )}
              </Box>
            </ViewCard>

            {/* Contact details */}
            <ViewCard
              id="section-contact"
              icon={<ContactMail />}
              title="Contact Details"
              subtitle="How people reach you"
              onEdit={() => setDrawer("contact")}
            >
              <InfoRow label="Email" value={contact?.email} />
              <InfoRow
                label="Phone numbers"
                value={
                  contact?.phones?.length
                    ? contact.phones.map((p) => `${p.number} (${p.type})`).join(" · ")
                    : undefined
                }
              />
              <InfoRow
                label="Address"
                value={
                  contact?.addresses?.length
                    ? contact.addresses
                        .map((a) =>
                          [a.street, a.city, [a.state, a.zipCode].filter(Boolean).join(" "), a.country]
                            .filter(Boolean)
                            .join(", "),
                        )
                        .join(" • ")
                    : undefined
                }
              />
              <Box sx={{ py: 1.25 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", mb: 0.75 }}
                >
                  Social links
                </Typography>
                {contact?.socialLinks?.length ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {contact.socialLinks.map((s, i) => (
                      <Chip
                        key={`${s.platform}-${i}`}
                        label={s.platform}
                        size="small"
                        color="primary"
                        variant="outlined"
                        clickable
                        component="a"
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: "capitalize" }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                    Not added
                  </Typography>
                )}
              </Box>
            </ViewCard>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Drawers ── */}
      <PersonalDetailsDrawer
        open={drawer === "personal"}
        onClose={() => setDrawer(null)}
        personalDetails={personal}
        onSaved={(updated) => {
          setPersonal(updated);
          if (updated.resumes) setResumes(updated.resumes);
          refreshCompletion();
        }}
      />
      <ContactDetailsDrawer
        open={drawer === "contact"}
        onClose={() => setDrawer(null)}
        contactDetails={contact}
        onSaved={(updated) => {
          setContact(updated);
          refreshCompletion();
        }}
      />
      <ResumeManagerDrawer
        open={drawer === "resume"}
        onClose={() => setDrawer(null)}
        resumes={resumes}
        onChange={(list) => {
          setResumes(list);
          refreshCompletion();
        }}
      />
    </>
  );
};

export default MyProfilePage;
