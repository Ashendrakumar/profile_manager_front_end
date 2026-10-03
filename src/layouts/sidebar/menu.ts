import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  Info,
  UsersRound,
  User,
  GraduationCap,
  BriefcaseBusiness,
  FolderGit2,
  Wrench,
  Settings,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  adminOnly?: boolean;
}

export const sidebarMenus: MenuItem[] = [
  {
    title: "Dashboard",
    path: ROUTES.HOME,
    icon: LayoutDashboard, // Perfect choice for general analytics overview
    adminOnly: true,
  },
  {
    title: "About",
    path: ROUTES.ABOUT,
    icon: Info, // Universal standard for app/company overview information
    adminOnly: true,
  },
  {
    title: "Users",
    path: ROUTES.USERS,
    icon: UsersRound, // Softer, cleaner group avatar aesthetic than base Users
    adminOnly: true,
  },
  {
    title: "My Profile",
    path: ROUTES.PROFILE, // Completion + Personal + Contact + Resume, edited via side drawers
    icon: User,
  },
  {
    title: "Education",
    path: ROUTES.EDUCATION,
    icon: GraduationCap, // The absolute gold standard icon for academic history
  },
  {
    title: "Experience",
    path: ROUTES.EXPERIENCE,
    icon: BriefcaseBusiness, // Sleeker, more corporate look than the default blocky briefcase
  },
  {
    title: "Projects",
    path: ROUTES.PROJECTS,
    icon: FolderGit2, // Ideal for portfolio development and code repository tracking
  },
  {
    title: "Skills",
    path: ROUTES.SKILLS,
    icon: Wrench, // Represents hard skills and technical tools better than a lightbulb
  },
  {
    title: "Certifications",
    path: ROUTES.CERTIFICATIONS,
    icon: ShieldCheck, // Standard, clean icon denoting private/personal settings
  },
  {
    title: "Documents",
    path: ROUTES.DOCUMENTS,
    icon: FolderKanban, // Standard, clean icon denoting private/personal settings
  },
  {
    title: "Settings",
    path: ROUTES.SETTINGS,
    icon: Settings, // Standard 8-cog wheel that visually balances with LayoutDashboard
  },
];
