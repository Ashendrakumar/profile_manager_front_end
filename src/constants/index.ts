/**
 * Application Constants
 * Centralized constants for the application
 */

export const APP_NAME = "Profile Manager";
export const APP_DESCRIPTION =
  "A production-ready Profile Management Application built with React and TypeScript.";

// API Configuration
// Default to JSONPlaceholder for demo purposes
// In production, set VITE_API_BASE_URL in .env file
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || //"http://localhost:10000/api";
  "https://profile-manager-back-end.onrender.com/api";

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  PORTFOLIO_DATA: "portfolio_data",
  PORTFOLIO_ID: "portfolio_id",
  SIDE_BAR: "is_side_bar_open",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  ERR_CANCELED: "ERR_CANCELED",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  ADMIN_ABOUT: "/about/admin",
  USERS: "/users",
  USER: "/users/:id",
  PERSONAL_DETAILS: "/personal-details",
  EDUCATION: "/education",
  EXPERIENCE: "/experience",
  PROJECTS: "/projects",
  SKILLS: "/skills",
  CERTIFICATIONS: "/certifications",
  ACHIEVEMENTS: "/achievements",
  DOCUMENTS: "/documents",
  PORTFOLIO: "/portfolio",
  SETTINGS: "/settings",
  CONTACT: "/contact-details",
  PROFILE: "/profile",
  PROFILE_COMPLETION: "/profile-completion",
  // auth_ROUTES
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp/:token",
  VERIFY_OTP_PAGE: "/verify-otp",
  NOT_FOUND: "/404",
} as const;

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const DIMENSIONS = {
  HEADER_HEIGHT: 65,
  SIDE_BAR_WIDTH: "15rem",
  SIDE_BAR_WIDTH_ICON: "4.25rem",
} as const;
