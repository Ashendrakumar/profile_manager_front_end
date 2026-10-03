/**
 * Routing Configuration
 * Centralized route definitions with lazy loading + unified RouteGuard
 */

import { lazy } from "react";
import { Navigate } from "react-router-dom";
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
const GoogleCallbackPage = lazy(
  () => import("@/modules/auth/pages/GoogleCallbackPage"),
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

const EducationSection = lazyNamed(
  () => import("@/modules/profile/components/EducationSection"),
  "EducationSection",
);
const CertificationSection = lazyNamed(
  () => import("@/modules/profile/components/CertificationSection"),
  "CertificationSection",
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

const NotFoundPage = lazy(
  () => import("@/modules/notFound/pages/NotFoundPage"),
);

const Inprogress = lazy(() => import("@/modules/Inprogress/Inprogress"));
const DocumentsPage = lazy(
  () => import("@/modules/documents/pages/DocumentsPage"),
);
const MyProfilePage = lazy(
  () => import("@/modules/profile/pages/MyProfilePage"),
);
const SettingsPage = lazy(
  () => import("@/modules/settings/pages/SettingsPage"),
);

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
  {
    // Google OAuth callback — must NOT be guarded (no token yet)
    path: ROUTES.GOOGLE_CALLBACK,
    element: <GoogleCallbackPage />,
    metadata: {
      title: "Signing in with Google... - Profile Manager",
      description: "Completing Google sign-in",
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
  // ── Retired: Personal & Contact are now merged into My Profile (/profile).
  //    Keep the old paths as redirects so existing links/bookmarks still land.
  {
    path: ROUTES.PERSONAL_DETAILS,
    element: <Navigate to={ROUTES.PROFILE} replace />,
  },
  {
    path: ROUTES.CONTACT,
    element: <Navigate to={ROUTES.PROFILE} replace />,
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
    path: ROUTES.CERTIFICATIONS,
    element: guard(<CertificationSection />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Certifications - Profile Manager",
      description: "Manage your certifications",
    },
  },
  {
    // Retired: the Profile Completion dashboard is now folded into My Profile.
    // Keep the old path as a redirect so existing links/bookmarks still land.
    path: ROUTES.PROFILE_COMPLETION,
    element: <Navigate to={ROUTES.PROFILE} replace />,
  },
  {
    path: ROUTES.PROFILE,
    element: guard(<MyProfilePage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "My Profile - Profile Manager",
      description:
        "Manage your personal details, contact information and resume in one place",
      keywords: "profile, personal, contact, resume",
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
    element: guard(<DocumentsPage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Documents - Profile Manager",
      description: "Manage your folders and uploaded documents",
      keywords: "documents, folders, upload",
    },
  },
  {
    path: ROUTES.SETTINGS,
    element: guard(<SettingsPage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "Settings - Profile Manager",
      description: "Manage your preferences, privacy and account security",
      keywords: "settings, preferences, privacy, password",
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
    element: guard(<NotFoundPage />, { isProtected: true }),
    isProtected: true,
    metadata: {
      title: "404 - Page Not Found",
      description: "The page you are looking for does not exist",
    },
  },
];
