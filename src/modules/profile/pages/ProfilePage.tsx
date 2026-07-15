/**
 * ProfilePage Component
 * Main profile page with tabs for different sections
 */

import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { useMetadata } from "@/hooks";
import { PersonalDetailsSection } from "../components/PersonalDetailsSection";
import { ContactDetailsSection } from "../components/ContactDetailsSection";
import { EducationSection } from "../components/EducationSection";
import { CertificationSection } from "../components/CertificationSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsSection } from "../components/SkillsSection";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

/**
 * Profile page component
 */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  useMetadata({
    title: "Profile - Profile Manager",
    description: "Manage your profile information",
    keywords: "profile, user, settings",
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Details
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your profile information and professional details
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", overflow: "hidden" }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-scrollButtons": {
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              },
            }}
          >
            <Tab label="Personal Details" />
            <Tab label="Contact Details" />
            <Tab label="Education" />
            <Tab label="Certifications" />
            <Tab label="Experience" />
            <Tab label="Projects" />
            <Tab label="Skills" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <PersonalDetailsSection />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ContactDetailsSection />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <EducationSection />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <CertificationSection />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <ExperienceSection />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <ProjectsSection />
          </TabPanel>
          <TabPanel value={activeTab} index={6}>
            <SkillsSection />
          </TabPanel>
        </Box>
      </Paper>
    </>
  );
};

export default ProfilePage;
