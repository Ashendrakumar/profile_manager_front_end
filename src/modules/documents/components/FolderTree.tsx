import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Delete, Edit, ChevronRight, ExpandMore } from "@mui/icons-material";
import { ActionMenu, type ActionMenuItem } from "@/common/components";
import type { FolderItem } from "../types";
import { FolderOpenDot, FolderDot } from "lucide-react";

interface FolderTreeProps {
  folders: FolderItem[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onEditFolder: (folder: FolderItem) => void;
  onDeleteFolder: (folder: FolderItem) => void;
}

export const FolderTree = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderTreeProps) => {
  const theme = useTheme();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Persist expanded state to localStorage so the tree remains expanded across reloads
  useEffect(() => {
    const key = "documents-folders-expanded";
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setExpanded(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const key = "documents-folders-expanded";
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, JSON.stringify(Array.from(expanded)));
    } catch {
      // ignore
    }
  }, [expanded]);

  // When a folder is selected, ensure its parent chain is expanded so it's visible
  useEffect(() => {
    if (!selectedFolderId) return;

    const parents = new Set<string>();
    let cursor = folders.find((f) => f._id === selectedFolderId);
    while (cursor && cursor.parentFolderId) {
      parents.add(cursor.parentFolderId);
      cursor = folders.find((f) => f._id === cursor?.parentFolderId);
    }

    if (parents.size > 0) {
      setExpanded((prev) => {
        const next = new Set(prev);
        parents.forEach((p) => next.add(p));
        return next;
      });
    }
  }, [selectedFolderId, folders]);
  const renderFolderTree = (parentFolderId: string | null, depth = 0) => {
    const childFolders = folders.filter(
      (folder) => folder.parentFolderId === parentFolderId,
    );

    return childFolders.map((folder) => {
      const isSelected = folder._id === selectedFolderId;
      const childItems = renderFolderTree(folder._id, depth + 1);
      const hasChildren = childItems.length > 0;
      const isExpanded = expanded.has(folder._id);

      const actions: ActionMenuItem[] = [
        {
          label: "Edit",
          icon: <Edit fontSize="small" />,
          onClick: () => onEditFolder(folder),
        },
        {
          label: "Delete",
          icon: <Delete fontSize="small" />,
          color: "error",
          onClick: () => onDeleteFolder(folder),
        },
      ];

      return (
        <Box key={folder._id}>
          <ListItem disablePadding>
            <ListItemButton
              selected={isSelected}
              onClick={() => onSelectFolder(folder._id)}
              sx={{
                mx: 0.75,
                my: 0.35,
                borderRadius: 1,
                bgcolor: isSelected
                  ? theme.palette.action.selected
                  : "transparent",
                color: isSelected ? theme.palette.text.primary : "inherit",
                py: 0.25,
                p: 0.25,
                pl: 0.25 + depth * 1.4,
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            >
              <ListItemIcon sx={{ minWidth: 35 }}>
                {hasChildren ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(folder._id);
                    }}
                  >
                    {isExpanded ? (
                      <ExpandMore fontSize="small" />
                    ) : (
                      <ChevronRight fontSize="small" />
                    )}
                  </IconButton>
                ) : null}
              </ListItemIcon>

              <ListItemIcon
                sx={{
                  minWidth: 30,
                  mr: 0.35,
                }}
              >
                {isExpanded ? <FolderOpenDot /> : <FolderDot />}
              </ListItemIcon>

              <ListItemText
                primary={folder.name}
                secondary={`${folder.documents.length} item${folder.documents.length === 1 ? "" : "s"}`}
                primaryTypographyProps={{
                  noWrap: true,
                  sx: {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  sx: {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
              <ActionMenu
                items={actions}
                tooltip="Folder actions"
                size="small"
              />
            </ListItemButton>
          </ListItem>

          {hasChildren ? (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box>{childItems}</Box>
            </Collapse>
          ) : null}
        </Box>
      );
    });
  };

  return <List disablePadding>{renderFolderTree(null)}</List>;
};
