// menu.ts

import {
  Dashboard,
  Person,
  School,
  Work,
  Folder,
  Psychology,
  Settings,
  Task,
  ContactPage,
  SupervisedUserCircleSharp,
} from "@mui/icons-material";

import { ROUTES } from "@/constants";

export const sidebarMenus = [
  {
    title: "Dashboard",
    path: ROUTES.HOME,
    icon: Dashboard,
    adminOnly: true,
  },
  {
    title: "About",
    path: ROUTES.ADMIN_ABOUT,
    icon: Person,
    adminOnly: true,
  },
  {
    title: "Users",
    path: ROUTES.USERS,
    icon: SupervisedUserCircleSharp,
    adminOnly: true,
  },
  {
    title: "Profile Completion",
    path: ROUTES.PROFILE_COMPLETION,
    icon: Task,
  },
  {
    title: "Contact Details",
    path: ROUTES.CONTACT,
    icon: ContactPage,
  },
  {
    title: "Personal",
    path: ROUTES.PERSONAL_DETAILS,
    icon: Person,
  },
  {
    title: "Education",
    path: ROUTES.EDUCATION,
    icon: School,
  },
  {
    title: "Experience",
    path: ROUTES.EXPERIENCE,
    icon: Work,
  },
  {
    title: "Projects",
    path: ROUTES.PROJECTS,
    icon: Folder,
  },
  {
    title: "Skills",
    path: ROUTES.SKILLS,
    icon: Psychology,
  },
  {
    title: "Settings",
    path: ROUTES.SETTINGS,
    icon: Settings,
  },
];
