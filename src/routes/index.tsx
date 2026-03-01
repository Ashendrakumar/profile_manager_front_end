/**
 * Routing Configuration
 * Centralized route definitions with lazy loading
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { PageMetadata } from '@/utils/metadata';
import { AuthGuard } from './AuthGuard';
import { AdminGuard } from './AdminGuard';
import { PublicRouteGuard } from './PublicRouteGuard';

/**
 * Route configuration interface
 * Extends React Router's RouteObject with metadata
 * Ensures path and element are required (not optional like in RouteObject)
 */
export interface AppRoute extends Omit<RouteObject, 'path' | 'element'> {
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
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage'));

// Protected routes
const HomePage = lazy(() => import('@/modules/home/pages/HomePage'));
const AboutPage = lazy(() => import('@/modules/about/pages/AboutPage'));
const UsersPage = lazy(() => import('@/modules/users/pages/UsersPage'));
const UserDetailPage = lazy(() => import('@/modules/users/pages/UserDetailPage'));
const ProfilePage = lazy(() => import('@/modules/profile/pages/ProfilePage'));

// Other routes
const NotFoundPage = lazy(() => import('@/modules/notFound/pages/NotFoundPage'));

/**
 * Application routes configuration
 * Each route includes metadata for SEO (title, description, etc.)
 */
export const routes: AppRoute[] = [
  // Public routes (login, register)
  {
    path: '/login',
    element: (
      <PublicRouteGuard>
        <LoginPage />
      </PublicRouteGuard>
    ),
    isPublic: true,
    metadata: {
      title: 'Login - Profile Manager',
      description: 'Sign in to your account',
      keywords: 'login, sign in, authentication',
    },
  },
  {
    path: '/register',
    element: (
      <PublicRouteGuard>
        <RegisterPage />
      </PublicRouteGuard>
    ),
    isPublic: true,
    metadata: {
      title: 'Register - Profile Manager',
      description: 'Create a new account',
      keywords: 'register, sign up, create account',
    },
  },
  
  // Protected routes (require authentication)
  {
    path: '/',
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: 'Home - Profile Manager',
      description: 'Welcome to Profile Manager - A production-ready React application',
      keywords: 'react, home, welcome',
    },
  },
  {
    path: '/about',
    element: (
      <AuthGuard>
        <AboutPage />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: 'About Us - Profile Manager',
      description: 'Learn more about Profile Manager and our mission',
      keywords: 'about, information, company',
    },
  },
  {
    path: '/users',
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
      title: 'Users - Profile Manager',
      description: 'Browse and manage users',
      keywords: 'users, manage, list',
    },
  },
  {
    path: '/users/:id',
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
      title: 'User Details - Profile Manager',
      description: 'View user details and information',
      keywords: 'user, details, profile',
    },
  },
  {
    path: '/profile',
    element: (
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    ),
    isProtected: true,
    metadata: {
      title: 'Profile - Profile Manager',
      description: 'Manage your profile information',
      keywords: 'profile, user, settings',
    },
  },
  
  // 404 route (public)
  {
    path: '*',
    element: <NotFoundPage />,
    isPublic: true,
    metadata: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist',
    },
  },
];
