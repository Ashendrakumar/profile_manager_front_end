/**
 * ProfilePage Component
 * Main profile page with tabs for different sections
 */

import { useEffect, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { useMetadata } from "@/hooks";
import { PersonalDetailsSection } from "../components/PersonalDetailsSection";
import { ContactDetailsSection } from "../components/ContactDetailsSection";
import { EducationSection } from "../components/EducationSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsSection } from "../components/SkillsSection";
import { useLocation } from "react-router-dom";

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
  const route = useLocation();
  const [userId, setUserId] = useState("");
  useMetadata({
    title: "Profile - Profile Manager",
    description: "Manage your profile information",
    keywords: "profile, user, settings",
  });

  useEffect(() => {
    const id = route.pathname.split("/")[2];
    setUserId(id);
  }, [route]);

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

      {/* Profile Completion Dashboard */}
      {/* <Box sx={{ mt: 3 }}>
        <ProfileCompletionDashboard
          onSectionClick={(section) => {
            // Map section names to tab indices
            const sectionToTabMap: Record<string, number> = {
              personalDetails: 0,
              contactDetails: 1,
              education: 2,
              experience: 3,
              projects: 4,
              skills: 5,
            };
            const tabIndex = sectionToTabMap[section];
            if (tabIndex !== undefined) {
              setActiveTab(tabIndex);
            }
          }}
        />
      </Box> */}

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
            <ExperienceSection />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <ProjectsSection />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <SkillsSection />
          </TabPanel>
        </Box>
      </Paper>
    </>
  );
};

export default ProfilePage;
