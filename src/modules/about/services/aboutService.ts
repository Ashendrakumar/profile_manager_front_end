/**
 * About Service
 * API service for managing About page content
 */

import { apiService } from "@/services/api";

export interface Feature {
  title: string;
  description: string;
}

export interface AboutData {
  _id?: string;
  title: string;
  description: string;
  features: Feature[];
  createdBy?: {
    _id: string;
    username: string;
    email: string;
  };
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = "/about";

export const aboutService = {
  /**
   * Get published About content (public endpoint)
   */
  getAbout: async (): Promise<AboutData> => {
    return apiService.get<AboutData>(`${API_BASE}`);
  },

  /**
   * Get About content for admin (includes unpublished)
   */
  getAboutForAdmin: async (): Promise<AboutData> => {
    return apiService.get<AboutData>(`${API_BASE}/admin/get`);
  },

  /**
   * Create About content (admin only)
   */
  createAbout: async (
    data: Omit<AboutData, "_id" | "createdAt" | "updatedAt">,
  ): Promise<AboutData> => {
    return apiService.post<AboutData>(`${API_BASE}/admin/create`, data);
  },

  /**
   * Update About content (admin only)
   */
  updateAbout: async (
    id: string,
    data: Partial<AboutData>,
  ): Promise<AboutData> => {
    return apiService.put<AboutData>(`${API_BASE}/admin/update/${id}`, data);
  },

  /**
   * Delete About content (admin only)
   */
  deleteAbout: async (id: string): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(
      `${API_BASE}/admin/delete/${id}`,
    );
  },
};
