/**
 * ProjectDetails Component
 * Read-only side panel showing the full details of a project.
 */

import { Box, Chip, Divider, Link, Typography } from "@mui/material";
import { Launch, Code } from "@mui/icons-material";
import { SideDrawer } from "@/common/components/SideDrawer";
import type { Project } from "../services/profileService";
import { HelperFunctions } from "@/utils/helpers";

interface ProjectDetailsProps {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
}

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ fontWeight: 600, letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Box sx={{ mt: 0.5 }}>{children}</Box>
  </Box>
);

export const ProjectDetails = ({
  open,
  project,
  onClose,
}: ProjectDetailsProps) => {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Project Details"
      subTitle={project?.title || ""}
    >
      {project && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {HelperFunctions.capitalizeString(project.title)}
            </Typography>
            {project.projectType && (
              <Chip
                label={project.projectType}
                size="small"
                color={
                  project.projectType === "Professional" ? "primary" : "default"
                }
              />
            )}
          </Box>

          {project.company && (
            <Section label="Company">
              <Typography variant="body2">{project.company}</Typography>
            </Section>
          )}

          <Divider sx={{ mb: 2.5 }} />

          <Section label="Description">
            <Box
              sx={{
                "& p": { mb: 1 },
                "& ul": { mb: 1, pl: 2.5 },
                "& li": { mb: 0.5 },
                "& strong": { fontWeight: "bold" },
                "& em": { fontStyle: "italic" },
              }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </Section>

          {project.technologies && project.technologies.length > 0 && (
            <Section label="Technologies">
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {project.technologies.map((tech, idx) => (
                  <Chip
                    key={idx}
                    label={tech}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Section>
          )}

          {(project.projectUrl || project.githubRepo) && (
            <Section label="Links">
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {project.projectUrl && (
                  <Link
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Chip
                      icon={<Launch />}
                      label="Live Demo"
                      size="small"
                      clickable
                      color="primary"
                    />
                  </Link>
                )}
                {project.githubRepo && (
                  <Link
                    href={project.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Chip icon={<Code />} label="GitHub" size="small" clickable />
                  </Link>
                )}
              </Box>
            </Section>
          )}
        </Box>
      )}
    </SideDrawer>
  );
};
