/**
 * UserDetailPage Component
 * Admin view: fetches a specific user by id and renders that user's full
 * profile (personal, contact, education, experience, projects, skills,
 * portfolio, resumes) — read-only.
 */

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button,
  Container,
  Chip,
  Divider,
  Avatar,
  Stack,
  Link,
  LinearProgress,
} from "@mui/material";
import {
  MailOutline,
  Verified,
  Phone as PhoneIcon,
  LocationOn,
  Link as LinkIcon,
  Download,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { userService } from "../services/userService";
import type { UserDetail } from "../services/userService";
import { API_BASE_URL } from "@/constants";
import { SkeletonLoader } from "@/common/components";

/**
 * Simple titled card wrapper for a read-only detail section.
 */
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </CardContent>
  </Card>
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

/**
 * User detail page component
 */
const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullName =
    [user?.personalDetails?.firstName, user?.personalDetails?.lastName]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "User";

  // Set page metadata
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
        // Pass the selected user's id to the backend to fetch THAT user's
        // full details (admins are authorized server-side for any user).
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <SkeletonLoader variant="detail" lines={8} />
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "User not found"}
        </Alert>
        <Button
          variant="contained"
          size="medium"
          onClick={() => navigate("/users")}
        >
          Back to Users
        </Button>
      </Container>
    );
  }

  const personal = user.personalDetails;
  const contact = user.contactDetails;
  const profileImage = toAbsoluteUrl(user.profileImage);

  return (
    <Container maxWidth="md">
      <Button
        variant="outlined"
        size="medium"
        onClick={() => navigate("/users")}
        sx={{ mb: 3 }}
      >
        ← Back to Users
      </Button>

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={profileImage}
              sx={{ width: 72, height: 72, fontSize: 28 }}
            >
              {fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" component="h1">
                  {fullName}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color={user.role === "admin" ? "primary" : "default"}
                  variant={user.role === "admin" ? "filled" : "outlined"}
                />
                {user.isVerified && (
                  <Chip
                    icon={<Verified fontSize="small" />}
                    label="Verified"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>
              {personal?.jobRole && (
                <Typography variant="body1" color="text.secondary">
                  {personal.jobRole}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Stack>

          {personal?.profileDescription && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {personal.profileDescription}
            </Typography>
          )}

          {typeof user.profileCompletion?.percentage === "number" && (
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Profile completion
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.profileCompletion.percentage}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={user.profileCompletion.percentage}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Section title="Contact Information">
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MailOutline fontSize="small" color="action" />
            <Typography variant="body1">{user.email}</Typography>
          </Stack>
          {contact?.phones?.map((phone, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body1">
                {phone.number}
                {phone.type ? ` (${phone.type})` : ""}
              </Typography>
            </Stack>
          ))}
          {contact?.addresses?.map((addr, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body1">
                {[addr.street, addr.city, addr.state, addr.zipCode, addr.country]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Stack>
          ))}
          {contact?.socialLinks?.map((social, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <LinkIcon fontSize="small" color="action" />
              <Link href={social.url} target="_blank" rel="noopener">
                {social.platform}
              </Link>
            </Stack>
          ))}
        </Stack>
      </Section>

      {/* Education */}
      {!!user.education?.length && (
        <Section title="Education">
          <Stack spacing={2}>
            {user.education.map((edu, i) => (
              <Box key={edu._id || i}>
                {i > 0 && <Divider sx={{ mb: 2 }} />}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {edu.standard}
                  {edu.specialization ? ` — ${edu.specialization}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[edu.institution, edu.university].filter(Boolean).join(", ")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.passingYear}
                  {edu.grade ? ` • ${edu.grade}` : ""}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      {/* Experience */}
      {!!user.experience?.length && (
        <Section title="Experience">
          <Stack spacing={2}>
            {user.experience.map((exp, i) => (
              <Box key={exp._id || i}>
                {i > 0 && <Divider sx={{ mb: 2 }} />}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {exp.role} @ {exp.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(exp.startDate)} –{" "}
                  {exp.isCurrentlyWorking
                    ? "Present"
                    : formatDate(exp.endDate) || "—"}
                </Typography>
                {exp.roleDescription && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {exp.roleDescription}
                  </Typography>
                )}
                {!!exp.technologiesUsed?.length && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
                  >
                    {exp.technologiesUsed.map((tech) => (
                      <Chip key={tech} label={tech} size="small" />
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      {/* Projects */}
      {!!user.projects?.length && (
        <Section title="Projects">
          <Stack spacing={2}>
            {user.projects.map((proj, i) => (
              <Box key={proj._id || i}>
                {i > 0 && <Divider sx={{ mb: 2 }} />}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {proj.title}
                  </Typography>
                  <Chip label={proj.projectType} size="small" variant="outlined" />
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
                    <Link href={proj.projectUrl} target="_blank" rel="noopener">
                      Live
                    </Link>
                  )}
                  {proj.githubRepo && (
                    <Link href={proj.githubRepo} target="_blank" rel="noopener">
                      Repository
                    </Link>
                  )}
                </Stack>
                {!!proj.technologies?.length && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
                  >
                    {proj.technologies.map((tech) => (
                      <Chip key={tech} label={tech} size="small" />
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </Section>
      )}

      {/* Skills */}
      {!!user.skills?.length && (
        <Section title="Skills">
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {user.skills.map((skill, i) => (
              <Chip
                key={skill._id || i}
                label={`${skill.name} • ${skill.level}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Section>
      )}

      {/* Portfolio */}
      {user.portfolio?.link && (
        <Section title="Portfolio">
          <Link href={user.portfolio.link} target="_blank" rel="noopener">
            {user.portfolio.link}
          </Link>
        </Section>
      )}

      {/* Resumes */}
      {!!user.resumes?.length && (
        <Section title="Resumes">
          <Stack spacing={1}>
            {user.resumes.map((resume) => (
              <Stack
                key={resume._id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Download fontSize="small" color="action" />
                <Link
                  href={resume.downloadUrl || toAbsoluteUrl(resume.filePath)}
                  target="_blank"
                  rel="noopener"
                >
                  {resume.fileName}
                </Link>
                {resume.isPrimary && (
                  <Chip label="Primary" size="small" color="primary" />
                )}
              </Stack>
            ))}
          </Stack>
        </Section>
      )}
    </Container>
  );
};

export default UserDetailPage;
