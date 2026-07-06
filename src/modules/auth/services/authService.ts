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
 * OTP verification request payload
 */
export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

/**
 * Registration step-1 response (no token yet — awaiting OTP)
 */
export interface RegisterPendingResponse {
  message: string;
  email: string;
  otpToken?: string;
}

/**
 * Authentication response from backend (returned after OTP verification or login)
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
  avatarUrl?: string;
  [key: string]: unknown;
}

/**
 * Authentication Service
 * Provides methods for login, register, OTP verify/resend, logout, and token management
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
   * Register new user — Step 1
   * Sends OTP to email. Returns { message, email } — no token yet.
   */
  async register(userData: RegisterRequest): Promise<RegisterPendingResponse> {
    const response = await apiService.post<RegisterPendingResponse>(
      "/users/register",
      userData,
    );
    return response;
  },

  /**
   * Verify OTP — Step 2
   * Validates the OTP, marks the user as verified, and returns the JWT.
   */
  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/users/verify-otp", {
      email,
      otp,
    });

    // Store tokens after successful verification
    if (response.accessToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
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
   * Resend OTP email
   */
  async resendOtp(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>("/users/resend-otp", { email });
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post("/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiService.get<{ user: User }>("/users/me");
  },
};
