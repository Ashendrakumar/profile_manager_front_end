/**
 * Routing Configuration
 * Centralized route definitions with lazy loading
 */

import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import type { PageMetadata } from "@/utils/metadata";
import { AuthGuard } from "./AuthGuard";
import { AdminGuard } from "./AdminGuard";
import { PublicRouteGuard } from "./PublicRouteGuard";
import { ROUTES } from "@/constants";

/**
 * Route configuration interface
 * Extends React Router's RouteObject with metadata
 * Ensures path and element are required (not optional like in RouteObject)
 */
export interface AppRoute extends Omit<RouteObject, "path" | "element"> {
  path: string;
  element: React.ReactElement;
  metadata?: PageMetadata;
  isPublic?: boolean; // If true, route is accessible without authentication
  isProtected?: boolean; // If true, route requires authentication
  requiresAdmin?: boolean; // If true, route requires admin role
}

/**
 * Lazy load pages/components for code splitting
 */
// Public routes
const LoginPage = lazy(() => import("@/modules/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/modules/auth/pages/RegisterPage"));
const OtpVerificationPage = lazy(
  () => import("@/modules/auth/pages/OtpVerificationPage"),
);

// Protected routes
const HomePage = lazy(() => import("@/modules/home/pages/HomePage"));
// const AboutPage = lazy(() => import("@/modules/about/pages/AboutPage"));
const AdminAboutPanel = lazy(
  () => import("@/modules/about/pages/AdminAboutPanel"),
);
const UsersPage = lazy(() => import("@/modules/users/pages/UsersPage"));
const UserDetailPage = lazy(
  () => import("@/modules/users/pages/UserDetailPage"),
);
const ProfilePage = lazy(() => import("@/modules/profile/pages/ProfilePage"));

const PersonalDetailsSection = lazy(() =>
  import("@/modules/profile/components/PersonalDetailsSection").then(
    (module) => ({ default: module.PersonalDetailsSection }),
  ),
);

const ContactDetailsSection = lazy(() =>
  import("@/modules/profile/components/ContactDetailsSection").then(
    (module) => ({ default: module.ContactDetailsSection }),
  ),
);
const EducationSection = lazy(() =>
  import("@/modules/profile/components/EducationSection").then((module) => ({
    default: module.EducationSection,
  })),
);
const ExperienceSection = lazy(() =>
  import("@/modules/profile/components/ExperienceSection").then((module) => ({
    default: module.ExperienceSection,
  })),
);
const ProjectsSection = lazy(() =>
  import("@/modules/profile/components/ProjectsSection").then((module) => ({
    default: module.ProjectsSection,
  })),
);
const SkillsSection = lazy(() =>
  import("@/modules/profile/components/SkillsSection").then((module) => ({
    default: module.SkillsSection,
  })),
);

const ProfileCompletionDashboard = lazy(() =>
  import("@/modules/profile/components/ProfileCompletionDashboard").then(
    (module) => ({ default: module.ProfileCompletionDashboard }),
  ),
);

const NotFoundPage = lazy(
  () => import("@/modules/notFound/pages/NotFoundPage"),
);

/**
 * Application routes configuration
 * Each route includes metadata for SEO (title, description, etc.)
 */
export const routes: AppRoute[] = [
  // Public routes (login, register)
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRouteGuard>
        <LoginPage />
      </PublicRouteGuard>
    ),
    isPublic: true,
    metadata: {
      title: "Login - Profile Manager",
      description: "Sign in to your account",
      keywords: "login, sign in, authentication",
    },
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRouteGuard>
        <RegisterPage />
      </PublicRouteGuard>
    ),
    isPublic: true,
    metadata: {
      title: "Register - Profile Manager",
      description: "Create a new account",
      keywords: "register, sign up, create account",
    },
  },
  {
    path: ROUTES.VERIFY_OTP,
    element: (
      <PublicRouteGuard>
        <OtpVerificationPage />
      </PublicRouteGuard>
    ),
    isPublic: true,
    metadata: {
      title: "Verify Email - Profile Manager",
      description: "Verify your email address with OTP",
      keywords: "otp, verify, email verification",
    },
  },

  // Protected routes (require authentication)
  {
    path: ROUTES.HOME,
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Home - Profile Manager",
      description:
        "Welcome to Profile Manager - A production-ready React application",
      keywords: "react, home, welcome",
    },
  },
  // {
  //   path: ROUTES.ABOUT,
  //   element: (
  //     <AuthGuard>
  //       <AboutPage />
  //     </AuthGuard>
  //   ),
  //   isProtected: true,
  //   metadata: {
  //     title: "About Us - Profile Manager",
  //     description: "Learn more about Profile Manager and our mission",
  //     keywords: "about, information, company",
  //   },
  // },
  {
    path: "/admin/about",
    element: (
      <AuthGuard>
        <AdminGuard>
          <AdminAboutPanel />
        </AdminGuard>
      </AuthGuard>
    ),
    isProtected: true,
    requiresAdmin: true,
    metadata: {
      title: "Manage About - Profile Manager",
      description: "Manage About page content",
      keywords: "admin, about, manage",
    },
  },
  {
    path: ROUTES.USERS,
    element: (
      <AuthGuard>
        <AdminGuard>
          <UsersPage />
        </AdminGuard>
      </AuthGuard>
    ),
    isProtected: true,
    requiresAdmin: true,
    metadata: {
      title: "Users - Profile Manager",
      description: "Browse and manage users",
      keywords: "users, manage, list",
    },
  },
  {
    path: ROUTES.USER,
    element: (
      <AuthGuard>
        <AdminGuard>
          <UserDetailPage />
        </AdminGuard>
      </AuthGuard>
    ),
    isProtected: true,
    requiresAdmin: true,
    metadata: {
      title: "User Details - Profile Manager",
      description: "View user details and information",
      keywords: "user, details, profile",
    },
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },
  {
    path: ROUTES.PERSONAL_DETAILS,
    element: (
      <AuthGuard>
        <PersonalDetailsSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },
  {
    path: ROUTES.PROJECTS,
    element: (
      <AuthGuard>
        <ProjectsSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },
  {
    path: ROUTES.SKILLS,
    element: (
      <AuthGuard>
        <SkillsSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },

  {
    path: ROUTES.EDUCATION,
    element: (
      <AuthGuard>
        <EducationSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },

  {
    path: ROUTES.EXPERIENCE,
    element: (
      <AuthGuard>
        <ExperienceSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },

  {
    path: ROUTES.CONTACT,
    element: (
      <AuthGuard>
        <ContactDetailsSection />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },

  {
    path: ROUTES.PROFILE_COMPLETION,
    element: (
      <AuthGuard>
        <ProfileCompletionDashboard />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: "Profile Details - Profile Manager",
      description: "Manage your profile information",
      keywords: "profile, user, settings",
    },
  },

  // 404 route (public)
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
