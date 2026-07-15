import type { FolderItem } from "../types";

const STORAGE_KEY = "profile-documents-folders";

export const createDefaultFolders = (): FolderItem[] => [
  {
    _id: "folder-1",
    name: "Professional Documents",
    description: "Certificates, resumes, and work-related files",
    createdAt: new Date().toISOString(),
    documents: [
      {
        _id: "doc-1",
        displayName: "Resume",
        fileName: "resume.pdf",
        fileType: "application/pdf",
        uploadedAt: new Date().toISOString(),
      },
    ],
  },
  {
    _id: "folder-2",
    name: "Portfolio Images",
    description: "Screenshots and visual assets",
    createdAt: new Date().toISOString(),
    documents: [
      {
        _id: "doc-2",
        displayName: "Dashboard Screenshot",
        fileName: "dashboard.png",
        fileType: "image/png",
        uploadedAt: new Date().toISOString(),
      },
    ],
  },
];

export const getStoredFolders = (): FolderItem[] => {
  if (typeof globalThis.window === "undefined") return createDefaultFolders();

  const stored = globalThis.window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return createDefaultFolders();

  try {
    return JSON.parse(stored) as FolderItem[];
  } catch {
    return createDefaultFolders();
  }
};

export const persistFolders = (folders: FolderItem[]) => {
  if (typeof globalThis.window !== "undefined") {
    globalThis.window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(folders),
    );
  }
};

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
