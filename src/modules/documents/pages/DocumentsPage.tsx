import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import {
  Box,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add,
  CreateNewFolder,
  Delete,
  Edit,
  UploadFile,
} from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { ConfirmDialog, ResponsiveButton } from "@/common/components";
import type { ActionMenuItem } from "@/common/components";
import { FolderTree } from "../components/FolderTree";
import { FolderDrawerForm } from "../components/FolderDrawerForm";
import { DocumentDrawerForm } from "../components/DocumentDrawerForm";
import { DocumentCard } from "../components/DocumentCard";
import type { DocumentItem, FolderItem, FolderOption } from "../types";
import {
  getStoredFolders,
  persistFolders,
  readFileAsDataUrl,
} from "../utils/documentStorage";

const DocumentsPage = () => {
  const { showSuccess, showError } = useToast();

  const [folders, setFolders] = useState<FolderItem[]>(getStoredFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    getStoredFolders()[0]?._id ?? null,
  );
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [folderDrawerOpen, setFolderDrawerOpen] = useState(false);
  const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(
    null,
  );
  const [folderDraft, setFolderDraft] = useState({
    name: "",
    description: "",
    parentFolderId: "",
  });
  const [documentDraft, setDocumentDraft] = useState({
    displayName: "",
    file: null as File | null,
    folderId: "",
  });
  const [deleteFolderTarget, setDeleteFolderTarget] =
    useState<FolderItem | null>(null);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState<{
    folderId: string;
    document: DocumentItem;
  } | null>(null);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder._id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  );

  const buildFolderPath = (folderId: string | null) => {
    if (!folderId) return [] as FolderItem[];
    const path: FolderItem[] = [];
    let cursor = folders.find((f) => f._id === folderId) ?? null;
    while (cursor) {
      path.unshift(cursor);
      cursor = cursor.parentFolderId
        ? (folders.find((f) => f._id === cursor?.parentFolderId) ?? null)
        : null;
    }
    return path;
  };

  const folderOptions = useMemo<FolderOption[]>(
    () =>
      folders.map((folder) => ({
        label: folder.parentFolderId ? `↳ ${folder.name}` : folder.name,
        value: folder._id,
      })),
    [folders],
  );

  const syncFolders = (nextFolders: FolderItem[]) => {
    setFolders(nextFolders);
    persistFolders(nextFolders);
  };

  const openCreateMenu = (event: MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const closeCreateMenu = () => setCreateMenuAnchor(null);

  const handleCreateSelection = (type: "folder" | "document") => {
    closeCreateMenu();

    if (type === "folder") {
      openFolderDrawer();
      return;
    }

    if (!selectedFolderId) {
      showError("Select or create a folder first");
      return;
    }

    openDocumentDrawer(selectedFolderId);
  };

  const openFolderDrawer = (folder: FolderItem | null = null) => {
    setEditingFolder(folder);
    setFolderDraft({
      name: folder?.name ?? "",
      description: folder?.description ?? "",
      parentFolderId: folder?.parentFolderId ?? "",
    });
    setFolderDrawerOpen(true);
  };

  const openDocumentDrawer = (
    folderId: string,
    document?: DocumentItem | null,
  ) => {
    setEditingDocument(document ?? null);
    setDocumentDraft({
      displayName: document?.displayName ?? "",
      file: null,
      folderId,
    });
    setSelectedFolderId(folderId);
    setDocumentDrawerOpen(true);
  };

  const handleFolderSubmit = (event?: FormEvent) => {
    event?.preventDefault();

    if (!folderDraft.name.trim()) {
      showError("Folder name is required");
      return;
    }

    const nextFolders = editingFolder
      ? folders.map((folder) =>
          folder._id === editingFolder._id
            ? {
                ...folder,
                name: folderDraft.name.trim(),
                description: folderDraft.description.trim(),
                parentFolderId: folderDraft.parentFolderId || null,
              }
            : folder,
        )
      : [
          {
            _id: `folder-${Date.now()}`,
            name: folderDraft.name.trim(),
            description: folderDraft.description.trim(),
            parentFolderId: folderDraft.parentFolderId || null,
            createdAt: new Date().toISOString(),
            documents: [],
          },
          ...folders,
        ];

    syncFolders(nextFolders);
    setSelectedFolderId(
      editingFolder ? editingFolder._id : (nextFolders[0]?._id ?? null),
    );
    setFolderDrawerOpen(false);
    setEditingFolder(null);
    setFolderDraft({ name: "", description: "", parentFolderId: "" });
    showSuccess(editingFolder ? "Folder updated" : "Folder created");
  };

  const handleDocumentSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const targetFolderId = documentDraft.folderId || selectedFolderId;
    if (!targetFolderId) {
      showError("Select a folder first");
      return;
    }

    if (!documentDraft.displayName.trim()) {
      showError("Display name is required");
      return;
    }

    const folder = folders.find((item) => item._id === targetFolderId);
    if (!folder) {
      showError("Folder not found");
      return;
    }

    let nextFileData = editingDocument?.fileData;
    let nextFileName = editingDocument?.fileName ?? "";
    let nextFileType = editingDocument?.fileType ?? "";

    if (documentDraft.file) {
      try {
        nextFileData = await readFileAsDataUrl(documentDraft.file);
        nextFileName = documentDraft.file.name;
        nextFileType = documentDraft.file.type || "application/octet-stream";
      } catch {
        showError("Unable to read the selected file");
        return;
      }
    }

    const nextDocuments = editingDocument
      ? folder.documents.map((document) =>
          document._id === editingDocument._id
            ? {
                ...document,
                displayName: documentDraft.displayName.trim(),
                fileName: nextFileName || document.fileName,
                fileType: nextFileType || document.fileType,
                fileData: nextFileData || document.fileData,
              }
            : document,
        )
      : [
          {
            _id: `doc-${Date.now()}`,
            displayName: documentDraft.displayName.trim(),
            fileName:
              nextFileName || documentDraft.file?.name || "Untitled file",
            fileType:
              nextFileType ||
              documentDraft.file?.type ||
              "application/octet-stream",
            fileData: nextFileData,
            uploadedAt: new Date().toISOString(),
          },
          ...folder.documents,
        ];

    syncFolders(
      folders.map((item) =>
        item._id === targetFolderId
          ? { ...item, documents: nextDocuments }
          : item,
      ),
    );
    setSelectedFolderId(targetFolderId);
    setDocumentDrawerOpen(false);
    setEditingDocument(null);
    setDocumentDraft({ displayName: "", file: null, folderId: "" });
    showSuccess(editingDocument ? "Document updated" : "Document uploaded");
  };

  const handleDeleteFolder = () => {
    if (!deleteFolderTarget) return;
    const nextFolders = folders.filter(
      (folder) => folder._id !== deleteFolderTarget._id,
    );
    syncFolders(nextFolders);
    if (selectedFolderId === deleteFolderTarget._id) {
      setSelectedFolderId(nextFolders[0]?._id ?? null);
    }
    setDeleteFolderTarget(null);
    showSuccess("Folder deleted");
  };

  const handleDeleteDocument = () => {
    if (!deleteDocumentTarget) return;
    const nextFolders = folders.map((folder) =>
      folder._id !== deleteDocumentTarget.folderId
        ? folder
        : {
            ...folder,
            documents: folder.documents.filter(
              (document) => document._id !== deleteDocumentTarget.document._id,
            ),
          },
    );
    syncFolders(nextFolders);
    setDeleteDocumentTarget(null);
    showSuccess("Document deleted");
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Documents & Folders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create folders, upload documents, and keep everything organized with
            display names.
          </Typography>
        </Box>
        <ResponsiveButton icon={<Add />} onClick={openCreateMenu}>
          Add New
        </ResponsiveButton>
        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={closeCreateMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => handleCreateSelection("folder")}>
            Create Folder
          </MenuItem>
          <MenuItem onClick={() => handleCreateSelection("document")}>
            Upload Document
          </MenuItem>
        </Menu>
      </Box>

      <Grid
        container
        spacing={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          height: "var(--documents-main-height, calc(100vh - 200px))",
        }}
      >
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            borderRight: { md: 1 },
            borderColor: { md: "divider" },
            bgcolor: "background.paper",
            width: { xs: "100%", md: 340 },
            maxWidth: { xs: "100%", md: 340 },
            flexBasis: { xs: "100%", md: 340 },
            flexGrow: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Folders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organize your documents.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <ResponsiveButton
                variant="outlined"
                size="medium"
                icon={<CreateNewFolder />}
                onClick={() => openFolderDrawer()}
              >
                New
              </ResponsiveButton>
            </Stack>
          </Box>
          <Box sx={{ px: 0, pb: 2, overflowY: "auto" }}>
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onEditFolder={openFolderDrawer}
              onDeleteFolder={setDeleteFolderTarget}
            />
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={9}
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {selectedFolder ? (
              <>
                <Box>
                  <Breadcrumbs aria-label="folder path" separator="|">
                    {buildFolderPath(selectedFolder._id).map((f, i, arr) => {
                      const isLast = i === arr.length - 1;
                      if (isLast) {
                        return (
                          <Typography
                            key={f._id}
                            variant="subtitle1"
                            color="primary"
                            fontWeight={700}
                          >
                            {f.name}
                          </Typography>
                        );
                      }

                      return (
                        <Link
                          key={f._id}
                          component="button"
                          underline="hover"
                          color="inherit"
                          onClick={() => setSelectedFolderId(f._id)}
                          sx={{
                            fontSize: "0.95rem",
                            textTransform: "none",
                            p: 0,
                          }}
                        >
                          {f.name}
                        </Link>
                      );
                    })}
                  </Breadcrumbs>

                  <Typography variant="body2" color="text.secondary">
                    {selectedFolder.description ||
                      "Manage your uploaded files here"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <ResponsiveButton
                    size="medium"
                    variant="outlined"
                    icon={<UploadFile />}
                    onClick={() => openDocumentDrawer(selectedFolder._id)}
                  >
                    Upload
                  </ResponsiveButton>
                </Stack>
              </>
            ) : (
              <Typography variant="subtitle1" fontWeight={700}>
                Select a folder
              </Typography>
            )}
          </Box>

          {selectedFolder ? (
            <Box sx={{ p: 2, overflowY: "auto", flex: 1, minHeight: 0 }}>
              {selectedFolder.documents.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    This folder is empty. Upload your first file.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {selectedFolder.documents.map((document) => {
                    const documentActions: ActionMenuItem[] = [
                      {
                        label: "Edit",
                        icon: <Edit />,
                        onClick: () =>
                          openDocumentDrawer(selectedFolder._id, document),
                      },
                      {
                        label: "Delete",
                        color: "error",
                        icon: <Delete />,
                        onClick: () =>
                          setDeleteDocumentTarget({
                            folderId: selectedFolder._id,
                            document,
                          }),
                      },
                    ];

                    return (
                      <Grid item xs={12} sm={6} lg={4} key={document._id}>
                        <DocumentCard
                          document={document}
                          actions={documentActions}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                p: 6,
                textAlign: "center",
                overflowY: "auto",
                flex: 1,
                minHeight: 0,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Choose a folder from the left to browse its contents.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <FolderDrawerForm
        open={folderDrawerOpen}
        title={editingFolder ? "Edit Folder" : "Create Folder"}
        footerActionName={editingFolder ? "Save" : "Create"}
        onClose={() => {
          setFolderDrawerOpen(false);
          setEditingFolder(null);
          setFolderDraft({ name: "", description: "", parentFolderId: "" });
        }}
        onSubmit={handleFolderSubmit}
        draft={folderDraft}
        onDraftChange={(field, value) =>
          setFolderDraft((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        folderOptions={[
          { label: "Main level", value: "" },
          ...folderOptions.filter(
            (option) => !editingFolder || option.value !== editingFolder._id,
          ),
        ]}
      />

      <DocumentDrawerForm
        open={documentDrawerOpen}
        title={editingDocument ? "Edit Document" : "Upload Document"}
        footerActionName={editingDocument ? "Save" : "Upload"}
        onClose={() => {
          setDocumentDrawerOpen(false);
          setEditingDocument(null);
          setDocumentDraft({ displayName: "", file: null, folderId: "" });
        }}
        onSubmit={handleDocumentSubmit}
        draft={documentDraft}
        onDraftChange={(field, value) =>
          setDocumentDraft((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        folderOptions={folderOptions}
      />

      <ConfirmDialog
        open={Boolean(deleteFolderTarget)}
        title="Delete Folder"
        message={`Are you sure you want to delete "${deleteFolderTarget?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteFolder}
        onCancel={() => setDeleteFolderTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteDocumentTarget)}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteDocumentTarget?.document.displayName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteDocument}
        onCancel={() => setDeleteDocumentTarget(null)}
      />
    </Box>
  );
};

export default DocumentsPage;
