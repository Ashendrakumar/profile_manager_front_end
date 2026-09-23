export interface DocumentItem {
  _id: string;
  displayName: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  filePath?: string;
  /** Absolute URL of the stored file (local uploads or Cloudflare R2). */
  fileUrl?: string;
  folderId?: string;
  uploadedAt: string;
  updatedAt?: string;
}

export interface FolderItem {
  _id: string;
  name: string;
  description?: string;
  parentFolderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  documents: DocumentItem[];
}

export type FolderOption = {
  label: string;
  value: string;
  disabled?: boolean;
};
