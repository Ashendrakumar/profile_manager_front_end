import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
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
import {
  ConfirmDialog,
  ResponsiveButton,
  SkeletonLoader,
} from "@/common/components";
import type { ActionMenuItem } from "@/common/components";
import { FolderTree } from "../components/FolderTree";
import { FolderDrawerForm } from "../components/FolderDrawerForm";
import { DocumentDrawerForm } from "../components/DocumentDrawerForm";
import { DocumentCard } from "../components/DocumentCard";
import type { DocumentItem, FolderItem, FolderOption } from "../types";
import { documentService } from "../services/documentService";

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { message?: string })?.message || fallback;

const DocumentsPage = () => {
  const { showSuccess, showError } = useToast();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>();
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

  // Folders come back with their documents embedded, so one request keeps the
  // tree and the document grid in sync after any mutation.
  const loadFolders = useCallback(
    async (preferredFolderId?: string | null) => {
      try {
        const { folders: nextFolders } = await documentService.getFolders();
        setFolders(nextFolders);
        setSelectedFolderId((current) => {
          const wanted = preferredFolderId ?? current;
          return wanted && nextFolders.some((folder) => folder._id === wanted)
            ? wanted
            : (nextFolders[0]?._id ?? null);
        });
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load documents"));
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

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

  const closeFolderDrawer = () => {
    setFolderDrawerOpen(false);
    setEditingFolder(null);
    setFolderDraft({ name: "", description: "", parentFolderId: "" });
  };

  const closeDocumentDrawer = () => {
    setDocumentDrawerOpen(false);
    setEditingDocument(null);
    setDocumentDraft({ displayName: "", file: null, folderId: "" });
    setUploadProgress(undefined);
  };

  const handleFolderSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!folderDraft.name.trim()) {
      showError("Folder name is required");
      return;
    }

    const payload = {
      name: folderDraft.name.trim(),
      description: folderDraft.description.trim(),
      parentFolderId: folderDraft.parentFolderId || null,
    };

    try {
      setActionLoading(true);
      const { folder } = editingFolder
        ? await documentService.updateFolder(editingFolder._id, payload)
        : await documentService.createFolder(payload);
      await loadFolders(folder._id);
      showSuccess(editingFolder ? "Folder updated" : "Folder created");
      closeFolderDrawer();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save folder"));
    } finally {
      setActionLoading(false);
    }
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

    if (!editingDocument && !documentDraft.file) {
      showError("Choose a file to upload");
      return;
    }

    const payload = {
      displayName: documentDraft.displayName.trim(),
      folderId: targetFolderId,
      file: documentDraft.file,
    };

    try {
      setActionLoading(true);
      if (documentDraft.file) setUploadProgress(0);
      if (editingDocument) {
        await documentService.updateDocument(
          editingDocument._id,
          payload,
          setUploadProgress,
        );
      } else {
        await documentService.uploadDocument(payload, setUploadProgress);
      }
      await loadFolders(targetFolderId);
      showSuccess(editingDocument ? "Document updated" : "Document uploaded");
      closeDocumentDrawer();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save document"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget) return;

    try {
      setActionLoading(true);
      await documentService.deleteFolder(deleteFolderTarget._id);
      // Fall back to the parent folder when the selected one was removed.
      await loadFolders(
        selectedFolderId === deleteFolderTarget._id
          ? deleteFolderTarget.parentFolderId
          : selectedFolderId,
      );
      setDeleteFolderTarget(null);
      showSuccess("Folder deleted");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete folder"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocumentTarget) return;

    try {
      setActionLoading(true);
      await documentService.deleteDocument(deleteDocumentTarget.document._id);
      setFolders((current) =>
        current.map((folder) =>
          folder._id !== deleteDocumentTarget.folderId
            ? folder
            : {
                ...folder,
                documents: folder.documents.filter(
                  (document) =>
                    document._id !== deleteDocumentTarget.document._id,
                ),
              },
        ),
      );
      setDeleteDocumentTarget(null);
      showSuccess("Document deleted");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete document"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} minItemWidth={320} gap={3} lines={2} />;
  }

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
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexGrow: 1,
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
        onClose={closeFolderDrawer}
        onSubmit={handleFolderSubmit}
        loading={actionLoading}
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
        onClose={closeDocumentDrawer}
        onSubmit={handleDocumentSubmit}
        loading={actionLoading}
        progress={uploadProgress}
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
        message={`Are you sure you want to delete "${deleteFolderTarget?.name}"? All of its subfolders and documents will be deleted too.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteFolder}
        onCancel={() => setDeleteFolderTarget(null)}
        loading={actionLoading}
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
        loading={actionLoading}
      />
    </Box>
  );
};

export default DocumentsPage;
