/**
 * User Service
 * API service for user-related operations
 */

import { apiService } from '@/services/api';

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
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    return apiService.get<User>(`/users/${id}`);
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
