import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  Info,
  UsersRound,
  UserCheck,
  ContactRound,
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
    title: "Profile Completion",
    path: ROUTES.PROFILE_COMPLETION,
    icon: UserCheck, // Highlights human profile progress/verification better than a clipboard
  },
  {
    title: "Contact Details",
    path: ROUTES.CONTACT,
    icon: ContactRound, // More modern than a basic phone icon for comprehensive contact data
  },
  {
    title: "Personal",
    path: ROUTES.PERSONAL_DETAILS,
    icon: User, // Standard, clean icon denoting private/personal settings
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
    path: ROUTES.ACHIEVEMENTS,
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
