/**
 * Document Service
 * API service for the Documents module (folders + uploaded files)
 */

import { apiService } from "@/services/api";
import type { DocumentItem, FolderItem } from "../types";

export interface FolderRequest {
  name?: string;
  description?: string;
  parentFolderId?: string | null;
}

export interface DocumentRequest {
  displayName?: string;
  folderId?: string;
  file?: File | null;
}

const API_BASE = "/documents";

const toFormData = ({ displayName, folderId, file }: DocumentRequest) => {
  const formData = new FormData();
  if (displayName !== undefined) formData.append("displayName", displayName);
  if (folderId) formData.append("folderId", folderId);
  if (file) formData.append("file", file);
  return formData;
};

const uploadConfig = (onProgress?: (percent: number) => void) => ({
  headers: { "Content-Type": "multipart/form-data" },
  onUploadProgress: (event: { loaded: number; total?: number }) => {
    if (onProgress && event.total) {
      onProgress(Math.round((event.loaded * 100) / event.total));
    }
  },
});

export const documentService = {
  // Folders (each returned with its documents)
  getFolders: async (): Promise<{ folders: FolderItem[] }> => {
    return apiService.get<{ folders: FolderItem[] }>(`${API_BASE}/folders`);
  },

  createFolder: async (
    data: FolderRequest,
  ): Promise<{ message: string; folder: FolderItem }> => {
    return apiService.post<{ message: string; folder: FolderItem }>(
      `${API_BASE}/folders`,
      data,
    );
  },

  updateFolder: async (
    folderId: string,
    data: FolderRequest,
  ): Promise<{ message: string; folder: FolderItem }> => {
    return apiService.put<{ message: string; folder: FolderItem }>(
      `${API_BASE}/folders/${folderId}`,
      data,
    );
  },

  deleteFolder: async (
    folderId: string,
  ): Promise<{
    message: string;
    deletedFolders: number;
    deletedDocuments: number;
  }> => {
    return apiService.delete(`${API_BASE}/folders/${folderId}`);
  },

  // Documents
  getDocuments: async (params?: {
    folderId?: string;
    search?: string;
  }): Promise<{ documents: DocumentItem[] }> => {
    return apiService.get<{ documents: DocumentItem[] }>(API_BASE, { params });
  },

  uploadDocument: async (
    data: DocumentRequest,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; document: DocumentItem }> => {
    return apiService.post<{ message: string; document: DocumentItem }>(
      API_BASE,
      toFormData(data),
      uploadConfig(onProgress),
    );
  },

  updateDocument: async (
    documentId: string,
    data: DocumentRequest,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; document: DocumentItem }> => {
    return apiService.put<{ message: string; document: DocumentItem }>(
      `${API_BASE}/${documentId}`,
      toFormData(data),
      uploadConfig(onProgress),
    );
  },

  deleteDocument: async (documentId: string): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(`${API_BASE}/${documentId}`);
  },
};
