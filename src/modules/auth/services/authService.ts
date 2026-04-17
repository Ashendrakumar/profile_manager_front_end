/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiService } from "@/services/api";
import { STORAGE_KEYS } from "@/constants";
import type { Portfolio } from "@/modules/profile";

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

/**
 * User information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
  portfolio: Portfolio;
  [key: string]: unknown;
}

/**
 * Authentication Service
 * Provides methods for login, register, logout, and token management
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      "/users/login",
      credentials,
    );

    // Store tokens
    if (response.accessToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      // Store user data
      if (response.user) {
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.user),
        );
      }
    }

    return response;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      "/users/register",
      userData,
    );
    debugger;
    // Store tokens
    if (response.accessToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      // Store user data
      if (response.user) {
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.user),
        );
      }
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiService.post("/users/logout");
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};
