/**
 * Routing Configuration
 * Centralized route definitions with lazy loading + unified RouteGuard
 */

import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import type { PageMetadata } from "@/utils/metadata";
import { RouteGuard } from "./RouteGuard";
import { ROUTES } from "@/constants";

/**
 * Route configuration interface
 * Extends React Router's RouteObject with metadata + guard flags.
 */
export interface AppRoute extends Omit<RouteObject, "path" | "element"> {
  path: string;
  element: React.ReactElement;
  metadata?: PageMetadata;
  /** Public-only: authenticated users are redirected away */
  isPublic?: boolean;
  /** Requires valid session */
  isProtected?: boolean;
  /** Requires valid session + admin role */
  requiresAdmin?: boolean;
}

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────

const LoginPage = lazy(() => import("@/modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/modules/auth/pages/RegisterPage"));
const OtpVerificationPage = lazy(
  () => import("@/modules/auth/pages/OtpVerificationPage"),
);

const HomePage = lazy(() => import("@/modules/home/pages/HomePage"));
const AboutPage = lazy(() => import("@/modules/about/pages/AboutPage"));
const AdminAboutPanel = lazy(
  () => import("@/modules/about/pages/AdminAboutPanel"),
);
const UsersPage = lazy(() => import("@/modules/users/pages/UsersPage"));
const UserDetailPage = lazy(
  () => import("@/modules/users/pages/UserDetailPage"),
);

const lazyNamed = <T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T,
) =>
  lazy(() =>
    loader().then((mod) => ({
      default: mod[exportName] as React.ComponentType,
    })),
  );

const PersonalDetailsSection = lazyNamed(
  () => import("@/modules/profile/components/PersonalDetailsSection"),
  "PersonalDetailsSection",
);
const ContactDetailsSection = lazyNamed(
  () => import("@/modules/profile/components/ContactDetailsSection"),
  "ContactDetailsSection",
);
const EducationSection = lazyNamed(
  () => import("@/modules/profile/components/EducationSection"),
  "EducationSection",
);
const ExperienceSection = lazyNamed(
  () => import("@/modules/profile/components/ExperienceSection"),
  "ExperienceSection",
);
const ProjectsSection = lazyNamed(
  () => import("@/modules/profile/components/ProjectsSection"),
  "ProjectsSection",
);
const SkillsSection = lazyNamed(
  () => import("@/modules/profile/components/SkillsSection"),
  "SkillsSection",
);
const ProfileCompletionDashboard = lazyNamed(
  () => import("@/modules/profile/components/ProfileCompletionDashboard"),
  "ProfileCompletionDashboard",
);

const NotFoundPage = lazy(
  () => import("@/modules/notFound/pages/NotFoundPage"),
);

const Inprogress = lazy(() => import("@/modules/Inprogress/Inprogress"));

// ── Helper: wrap a page element with RouteGuard ────────────────────────────────

type GuardFlags = Pick<AppRoute, "isPublic" | "isProtected" | "requiresAdmin">;

const guard = (element: React.ReactElement, flags: GuardFlags) => (
  <RouteGuard {...flags}>{element}</RouteGuard>
);

// ── Route definitions ──────────────────────────────────────────────────────────
export const routes: AppRoute[] = [
  // ── Public-only routes (redirect away when authenticated) ──────────────────
  {
    path: ROUTES.LOGIN,
    element: guard(<LoginPage />, { isPublic: true }),
    isPublic: true,
    metadata: {
      title: "Login - Profile Manager",
      description: "Sign in to your account",
      keywords: "login, sign in, authentication",
    },
  },
  {
    path: ROUTES.REGISTER,
    element: guard(<RegisterPage />, { isPublic: true }),
    isPublic: true,
    metadata: {
      title: "Register - Profile Manager",
      description: "Create a new account",
      keywords: "register, sign up, create account",
    },
  },
  {
    path: ROUTES.VERIFY_OTP,
    element: guard(<OtpVerificationPage />, { isPublic: true }),
    isPublic: true,
    metadata: {
      title: "Verify Email - Profile Manager",
      description: "Verify your email address with OTP",
      keywords: "otp, verify, email verification",
    },
  },

  // ── Protected routes ───────────────────────────────────────────────────────
  {
    path: ROUTES.HOME,
    element: guard(<HomePage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Home - Profile Manager",
      description: "Welcome to Profile Manager",
      keywords: "react, home, welcome",
    },
  },
  {
    path: ROUTES.ABOUT,
    element: guard(<AboutPage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "About Us - Profile Manager",
      description: "Learn more about Profile Manager and our mission",
      keywords: "about, information, company",
    },
  },
  {
    path: ROUTES.PERSONAL_DETAILS,
    element: guard(<PersonalDetailsSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Personal Details - Profile Manager",
      description: "Manage your personal details",
    },
  },
  {
    path: ROUTES.CONTACT,
    element: guard(<ContactDetailsSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Contact Details - Profile Manager",
      description: "Manage your contact information",
    },
  },
  {
    path: ROUTES.EDUCATION,
    element: guard(<EducationSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Education - Profile Manager",
      description: "Manage your education history",
    },
  },
  {
    path: ROUTES.EXPERIENCE,
    element: guard(<ExperienceSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Experience - Profile Manager",
      description: "Manage your work experience",
    },
  },
  {
    path: ROUTES.PROJECTS,
    element: guard(<ProjectsSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Projects - Profile Manager",
      description: "Manage your projects",
    },
  },
  {
    path: ROUTES.SKILLS,
    element: guard(<SkillsSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Skills - Profile Manager",
      description: "Manage your skills",
    },
  },
  {
    path: ROUTES.PROFILE_COMPLETION,
    element: guard(<ProfileCompletionDashboard />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Profile Completion - Profile Manager",
      description: "Track your profile completion",
    },
  },

  {
    path: ROUTES.ACHIEVEMENTS,
    element: guard(<Inprogress />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Inprogress - Profile Manager",
      description: "Inprogress or Working on it",
      keywords: "inprogress, working on it",
    },
  },

  {
    path: ROUTES.DOCUMENTS,
    element: guard(<Inprogress />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Inprogress - Profile Manager",
      description: "Inprogress or Working on it",
      keywords: "inprogress, working on it",
    },
  },

  // ── Admin-only routes ──────────────────────────────────────────────────────
  {
    path: ROUTES.ADMIN_ABOUT,
    element: guard(<AdminAboutPanel />, { requiresAdmin: true }),
    requiresAdmin: true,
    metadata: {
      title: "Manage About - Profile Manager",
      description: "Manage About page content",
      keywords: "admin, about, manage",
    },
  },
  {
    path: ROUTES.USERS,
    element: guard(<UsersPage />, { requiresAdmin: true }),
    requiresAdmin: true,
    metadata: {
      title: "Users - Profile Manager",
      description: "Browse and manage users",
      keywords: "users, manage, list",
    },
  },
  {
    path: ROUTES.USER,
    element: guard(<UserDetailPage />, { requiresAdmin: true }),
    requiresAdmin: true,
    metadata: {
      title: "User Details - Profile Manager",
      description: "View user details and information",
      keywords: "user, details, profile",
    },
  },

  // ── 404 ────────────────────────────────────────────────────────────────────
  {
    path: "*",
    element: <NotFoundPage />,
    isPublic: true,
    metadata: {
      title: "404 - Page Not Found",
      description: "The page you are looking for does not exist",
    },
  },
];
