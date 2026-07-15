export interface DocumentItem {
  _id: string;
  displayName: string;
  fileName: string;
  fileType: string;
  fileData?: string;
  uploadedAt: string;
}

export interface FolderItem {
  _id: string;
  name: string;
  description?: string;
  parentFolderId?: string | null;
  createdAt: string;
  documents: DocumentItem[];
}

export type FolderOption = {
  label: string;
  value: string;
  disabled?: boolean;
};
