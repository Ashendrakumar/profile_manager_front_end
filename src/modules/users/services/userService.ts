/**
 * User Service
 * API service for user-related operations
 */

import { apiService } from '@/services/api';
import type {
  PersonalDetails,
  ContactDetails,
  Education,
  Experience,
  Project,
  Skill,
  Portfolio,
  ResumeItem,
} from '@/modules/profile/services/profileService';

/**
 * User interface matching backend API
 */
export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  password?: string;
}

/**
 * Profile completion summary embedded on the user document.
 */
export interface UserProfileCompletion {
  percentage: number;
  completedSections: string[];
  lastCalculatedAt?: string;
}

/**
 * Full user detail returned by `GET /users/:id`.
 * Admins receive every profile section for the requested user; regular users
 * only receive this for their own id (enforced by the backend).
 */
export interface UserDetail {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isVerified?: boolean;
  personalDetails?: Partial<PersonalDetails>;
  contactDetails?: Partial<ContactDetails>;
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  skills?: Skill[];
  portfolio?: Portfolio;
  profileImage?: string;
  resumes?: ResumeItem[];
  profileCompletion?: UserProfileCompletion;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create User Request
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

/**
 * Update User Request
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

/**
 * User Service
 * Provides methods to interact with user API endpoints
 */
export const userService = {
  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    return apiService.get<User[]>('/users');
  },

  /**
   * Get a single user's full details by ID.
   *
   * Admins can fetch any user; the backend returns that specific user's entire
   * profile (personal, contact, education, experience, projects, skills,
   * portfolio, resumes) — not the logged-in user's.
   */
  getUserById: async (id: string): Promise<UserDetail> => {
    return apiService.get<UserDetail>(`/users/${id}`);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return apiService.get<User>('/users/me');
  },

  /**
   * Create a new user (Admin only)
   */
  createUser: async (userData: CreateUserRequest): Promise<{ message: string; user: User; }> => {
    return apiService.post<{ message: string; user: User; }>('/users/create', userData);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<{ message: string; user: User; }> => {
    return apiService.put<{ message: string; user: User; }>(`/users/${id}`, userData);
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (id: string): Promise<{ message: string; }> => {
    return apiService.delete<{ message: string; }>(`/users/${id}`);
  },
};
