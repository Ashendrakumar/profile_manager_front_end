/**
 * UserDetailPage — admin read-only view of one user's full profile.
 *
 * Two-column layout matching the app's design language: a sticky summary rail
 * (completion ring, identity, contact, documents) beside a content column of
 * section blocks (Education, Experience, Projects, Skills). Fetches the user by
 * id — admins are authorized server-side for any user.
 */

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  Avatar,
  Stack,
  Grid,
  Link,
  LinearProgress,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MailOutline,
  Verified,
  Phone as PhoneIcon,
  LocationOn,
  Link as LinkIcon,
  Download,
  ArrowBack,
  CalendarMonth,
  School,
  WorkOutline,
  FolderOpen,
  AutoAwesome,
  Launch,
  Person,
  ContactMail,
  Description,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { userService } from "../services/userService";
import type { UserDetail } from "../services/userService";
import { API_BASE_URL } from "@/constants";
import { SkeletonLoader, ResponsiveButton } from "@/common/components";
import { HelperFunctions } from "@/utils/helpers";

// Design-system tag color for skills (see ui-design-system: "Violet (tags)").
const VIOLET = "#7c5cff";

/**
 * Titled content card with an icon tile + optional count chip. Used for both
 * the rail panels (Contact, Documents) and the right-column section blocks.
 */
const PanelCard = ({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) => (
  <Card>
    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
            {title}
          </Typography>
        </Stack>
        {typeof count === "number" && (
          <Chip label={count} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </CardContent>
  </Card>
);

/** A bordered, static entry box for a single education/experience/project row. */
const Entry = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
    }}
  >
    {children}
  </Box>
);

const TechChips = ({ items }: { items: string[] }) => (
  <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}>
    {items.map((tech) => (
      <Chip key={tech} label={tech} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
    ))}
  </Stack>
);

/**
 * Build an absolute URL for a file/image path stored on the user document.
 * Stored paths are relative to the server host (e.g. "/uploads/profiles/x.webp"),
 * so we strip the trailing "/api" from the API base to reach the host root.
 */
const toAbsoluteUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const host = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${host}${path.startsWith("/") ? "" : "/"}${path}`;
};

const formatDate = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullName =
    [user?.personalDetails?.firstName, user?.personalDetails?.lastName]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "User";

  useMetadata({
    title: user ? `${fullName} - User Details` : "User Details - Profile Manager",
    description: user ? `View details for ${fullName}` : "View user details",
    keywords: "user, details, profile",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is required");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <SkeletonLoader variant="detail" lines={8} />;
  }

  if (error || !user) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "User not found"}
        </Alert>
        <ResponsiveButton icon={<ArrowBack />} onClick={() => navigate("/users")}>
          Back to Users
        </ResponsiveButton>
      </Box>
    );
  }

  const personal = user.personalDetails;
  const contact = user.contactDetails;
  const profileImage = toAbsoluteUrl(user.profileImage);
  const pct = user.profileCompletion?.percentage;
  const ringDeg = (pct ?? 0) * 3.6;
  const completedCount = user.profileCompletion?.completedSections?.length ?? 0;
  const joined = formatDate(user.createdAt);
  const isAdminRole = user.role === "admin";

  const hasContact = Boolean(
    user.email ||
      contact?.phones?.length ||
      contact?.addresses?.length ||
      contact?.socialLinks?.length,
  );
  const hasDocuments = Boolean(user.portfolio?.link || user.resumes?.length);
  const hasSections = Boolean(
    user.education?.length ||
      user.experience?.length ||
      user.projects?.length ||
      user.skills?.length,
  );

  // Group skills by category for a tidier presentation.
  const skillsByCategory: Record<string, typeof user.skills> = {};
  (user.skills ?? []).forEach((s) => {
    const key = s.category || "Other";
    (skillsByCategory[key] ??= []).push(s);
  });

  return (
    <>
      <ResponsiveButton
        icon={<ArrowBack />}
        variant="outlined"
        onClick={() => navigate("/users")}
        sx={{ mb: 3 }}
      >
        Back to Users
      </ResponsiveButton>

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Summary rail ── */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Box sx={{ position: { md: "sticky" }, top: 90, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Identity + completion */}
            <Card sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  height: 10,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark} 100%)`,
                }}
              />
              <CardContent sx={{ textAlign: "center", px: 3, pb: 3, pt: 2.5 }}>
                <Box sx={{ position: "relative", width: 132, height: 132, mx: "auto" }}>
                  <Box
                    sx={{
                      width: 132,
                      height: 132,
                      borderRadius: "50%",
                      p: "6px",
                      boxShadow: theme.shadows[3],
                      background: `conic-gradient(${theme.palette.primary.main} ${ringDeg}deg, ${theme.palette.divider} ${ringDeg}deg 360deg)`,
                    }}
                  >
                    <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: "background.paper", p: "5px" }}>
                      <Avatar
                        src={profileImage}
                        sx={{ width: "100%", height: "100%", fontSize: 30, fontWeight: 700, bgcolor: "primary.main" }}
                      >
                        {HelperFunctions.getInitials(fullName)}
                      </Avatar>
                    </Box>
                  </Box>
                  {typeof pct === "number" && (
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
                  )}
                </Box>

                <Typography variant="h6" sx={{ mt: 2.5, fontSize: "1.15rem" }}>
                  {fullName}
                </Typography>
                {personal?.jobRole && (
                  <Typography variant="body2" color="text.secondary">
                    {personal.jobRole}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={HelperFunctions.formatRole(user.role)}
                    size="small"
                    color={isAdminRole ? "primary" : "default"}
                    variant={isAdminRole ? "filled" : "outlined"}
                    sx={{ fontWeight: 600 }}
                  />
                  {user.isVerified && (
                    <Chip
                      icon={<Verified sx={{ fontSize: 14 }} />}
                      label="Verified"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>

                {typeof pct === "number" && (
                  <Box sx={{ mt: 2.5, textAlign: "left" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {completedCount} sections completed
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {pct}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                )}

                {joined && (
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 2, color: "text.secondary" }}>
                    <CalendarMonth sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Joined {joined}</Typography>
                  </Stack>
                )}

                {personal?.profileDescription && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                      {personal.profileDescription}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            {hasContact && (
              <PanelCard icon={<ContactMail />} title="Contact">
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MailOutline fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {user.email}
                    </Typography>
                  </Stack>
                  {contact?.phones?.map((phone, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {phone.number}
                        {phone.type ? ` (${phone.type})` : ""}
                      </Typography>
                    </Stack>
                  ))}
                  {contact?.addresses?.map((addr, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                      <LocationOn fontSize="small" color="action" sx={{ mt: 0.25 }} />
                      <Typography variant="body2">
                        {[addr.street, addr.city, addr.state, addr.zipCode, addr.country]
                          .filter(Boolean)
                          .join(", ")}
                      </Typography>
                    </Stack>
                  ))}
                  {!!contact?.socialLinks?.length && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
                      {contact.socialLinks.map((social, i) => (
                        <Chip
                          key={`${social.platform}-${i}`}
                          icon={<LinkIcon sx={{ fontSize: 14 }} />}
                          label={social.platform}
                          size="small"
                          color="primary"
                          variant="outlined"
                          clickable
                          component="a"
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: "capitalize", fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </PanelCard>
            )}

            {/* Documents */}
            {hasDocuments && (
              <PanelCard icon={<Description />} title="Documents">
                <Stack spacing={1.25}>
                  {user.portfolio?.link && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinkIcon fontSize="small" color="action" />
                      <Link
                        href={user.portfolio.link}
                        target="_blank"
                        rel="noopener"
                        variant="body2"
                        sx={{ wordBreak: "break-all" }}
                      >
                        Portfolio
                      </Link>
                    </Stack>
                  )}
                  {user.resumes?.map((resume) => (
                    <Stack key={resume._id} direction="row" spacing={1} alignItems="center">
                      <Description fontSize="small" color="action" />
                      <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                        {resume.fileName}
                      </Typography>
                      {resume.isPrimary && (
                        <Chip label="Primary" size="small" color="primary" sx={{ height: 20 }} />
                      )}
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          component="a"
                          href={resume.downloadUrl || toAbsoluteUrl(resume.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </PanelCard>
            )}
          </Box>
        </Grid>

        {/* ── Content column ── */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Stack spacing={3}>
            {/* Education */}
            {!!user.education?.length && (
              <PanelCard icon={<School />} title="Education" count={user.education.length}>
                <Stack spacing={2}>
                  {user.education.map((edu, i) => (
                    <Entry key={edu._id || i}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {edu.standard}
                        {edu.specialization ? ` — ${edu.specialization}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[edu.institution, edu.university].filter(Boolean).join(", ")}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, color: "text.secondary" }} flexWrap="wrap" useFlexGap>
                        <Typography variant="caption">{edu.passingYear}</Typography>
                        {edu.grade && <Typography variant="caption">• {edu.grade}</Typography>}
                        {edu.location && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationOn sx={{ fontSize: 14 }} />
                            <Typography variant="caption">{edu.location}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Entry>
                  ))}
                </Stack>
              </PanelCard>
            )}

            {/* Experience */}
            {!!user.experience?.length && (
              <PanelCard icon={<WorkOutline />} title="Experience" count={user.experience.length}>
                <Stack spacing={2}>
                  {user.experience.map((exp, i) => (
                    <Entry key={exp._id || i}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {exp.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.companyName}
                            {exp.location ? ` · ${exp.location}` : ""}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${formatDate(exp.startDate)} – ${exp.isCurrentlyWorking ? "Present" : formatDate(exp.endDate) || "—"}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      {exp.roleDescription && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {exp.roleDescription}
                        </Typography>
                      )}
                      {!!exp.responsibilities?.length && (
                        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5, color: "text.secondary" }}>
                          {exp.responsibilities.map((r, ri) => (
                            <Typography key={ri} component="li" variant="body2" sx={{ mb: 0.25 }}>
                              {r}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {!!exp.technologiesUsed?.length && <TechChips items={exp.technologiesUsed} />}
                    </Entry>
                  ))}
                </Stack>
              </PanelCard>
            )}

            {/* Projects */}
            {!!user.projects?.length && (
              <PanelCard icon={<FolderOpen />} title="Projects" count={user.projects.length}>
                <Stack spacing={2}>
                  {user.projects.map((proj, i) => (
                    <Entry key={proj._id || i}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {proj.title}
                        </Typography>
                        <Chip label={proj.projectType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </Stack>
                      {proj.company && (
                        <Typography variant="body2" color="text.secondary">
                          {proj.company}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {proj.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        {proj.projectUrl && (
                          <Link
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noopener"
                            variant="body2"
                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                          >
                            <Launch sx={{ fontSize: 15 }} /> Live
                          </Link>
                        )}
                        {proj.githubRepo && (
                          <Link
                            href={proj.githubRepo}
                            target="_blank"
                            rel="noopener"
                            variant="body2"
                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                          >
                            <Launch sx={{ fontSize: 15 }} /> Repository
                          </Link>
                        )}
                      </Stack>
                      {!!proj.technologies?.length && <TechChips items={proj.technologies} />}
                    </Entry>
                  ))}
                </Stack>
              </PanelCard>
            )}

            {/* Skills */}
            {!!user.skills?.length && (
              <PanelCard icon={<AutoAwesome />} title="Skills" count={user.skills.length}>
                <Stack spacing={2}>
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <Box key={category}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", mb: 1 }}
                      >
                        {category}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {(skills ?? []).map((skill, i) => (
                          <Chip
                            key={skill._id || i}
                            label={`${skill.name} · ${skill.level}`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              color: VIOLET,
                              bgcolor: alpha(VIOLET, 0.12),
                              border: `1px solid ${alpha(VIOLET, 0.3)}`,
                              "& .MuiChip-label": { px: 1.25 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </PanelCard>
            )}

            {/* Empty state */}
            {!hasSections && (
              <PanelCard icon={<Person />} title="Profile sections">
                <Stack alignItems="center" spacing={1} sx={{ py: 4, color: "text.secondary" }}>
                  <Person sx={{ fontSize: 40, opacity: 0.5 }} />
                  <Typography variant="body2">
                    This user hasn't added any profile sections yet.
                  </Typography>
                </Stack>
              </PanelCard>
            )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default UserDetailPage;
