/**
 * Settings Service
 * API service for user settings, password changes and account deletion
 */

import { apiService } from "@/services/api";

export type ThemePreference = "light" | "dark" | "system";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export interface PreferenceSettings {
  theme: ThemePreference;
  language: string;
  timezone: string;
  dateFormat: DateFormat;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  securityAlerts: boolean;
  profileReminders: boolean;
  certificationExpiry: boolean;
  productUpdates: boolean;
}

export interface PrivacySettings {
  portfolioVisibility: "public" | "private";
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showResumeDownload: boolean;
  showCertifications: boolean;
}

export interface UserSettings {
  preferences: PreferenceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  updatedAt?: string;
}

export type SettingsSection = "preferences" | "notifications" | "privacy";

export type UpdateSettingsRequest = {
  preferences?: Partial<PreferenceSettings>;
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
};

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface DeleteAccountRequest {
  password?: string;
  confirmText?: string;
}

const API_BASE = "/settings";

export const settingsService = {
  getSettings: async (): Promise<{ settings: UserSettings }> => {
    return apiService.get<{ settings: UserSettings }>(API_BASE);
  },

  updateSettings: async (
    data: UpdateSettingsRequest,
  ): Promise<{ message: string; settings: UserSettings }> => {
    return apiService.put<{ message: string; settings: UserSettings }>(
      API_BASE,
      data,
    );
  },

  resetSettings: async (
    section?: SettingsSection,
  ): Promise<{ message: string; settings: UserSettings }> => {
    return apiService.post<{ message: string; settings: UserSettings }>(
      `${API_BASE}/reset`,
      undefined,
      { params: section ? { section } : undefined },
    );
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    return apiService.put<{ message: string }>(
      `${API_BASE}/change-password`,
      data,
    );
  },

  deleteAccount: async (
    data: DeleteAccountRequest,
  ): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(`${API_BASE}/account`, {
      data,
    });
  },
};
