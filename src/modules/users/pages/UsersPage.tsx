/**
 * UsersPage — admin user management
 *
 * Design-system "admin table" pattern: a searchable table with avatar + name,
 * role chip, inline completion progress, verified status chip and a kebab
 * action menu (View / Edit / Delete). Rows link to the user detail page.
 * On mobile the table collapses to the reusable UserCard grid.
 *
 * The list endpoint returns only base fields, so each row's completion % and
 * verified status are enriched in the background via the detail endpoint.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Box,
  Grid,
  Alert,
  Stack,
  Avatar,
  Chip,
  Skeleton,
  LinearProgress,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
} from "@mui/material";
import { Add, Search, Verified, Visibility, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { useAuth } from "@/contexts";
import { useToast } from "@/contexts/toastContext";
import { userService } from "../services/userService";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../services/userService";
import {
  SkeletonLoader,
  ConfirmDialog,
  ResponsiveButton,
  ActionMenu,
  type ActionMenuItem,
} from "@/common/components";
import { HelperFunctions } from "@/utils/helpers";
import { UserForm } from "../components/UserForm";
import { UserCard } from "../components/UserCard";

// Per-user data pulled from the detail endpoint to fill the table.
interface EnrichedInfo {
  completion: number | null;
  verified: boolean;
  name: string;
  jobRole?: string;
}

const completionColor = (
  pct: number,
): "success" | "primary" | "warning" | "error" => {
  if (pct >= 100) return "success";
  if (pct >= 60) return "primary";
  if (pct >= 30) return "warning";
  return "error";
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [details, setDetails] = useState<Record<string, EnrichedInfo>>({});
  const [enriching, setEnriching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  useMetadata({
    title: "Users - Profile Manager",
    description: "Browse and manage users",
    keywords: "users, manage, list",
  });

  const enrich = useCallback(async (list: User[]) => {
    setEnriching(true);
    const settled = await Promise.allSettled(
      list.map(async (u) => {
        const id = u._id || u.id || "";
        const d = await userService.getUserById(id);
        const name =
          [d.personalDetails?.firstName, d.personalDetails?.lastName]
            .filter(Boolean)
            .join(" ") ||
          d.username ||
          u.username;
        return [
          id,
          {
            completion: d.profileCompletion?.percentage ?? null,
            verified: Boolean(d.isVerified),
            name,
            jobRole: d.personalDetails?.jobRole,
          },
        ] as const;
      }),
    );

    const map: Record<string, EnrichedInfo> = {};
    settled.forEach((s) => {
      if (s.status === "fulfilled") {
        const [id, info] = s.value;
        map[id] = info;
      }
    });
    setDetails(map);
    setEnriching(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
      // Fire-and-forget: table renders immediately, columns fill in after.
      void enrich(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enrich, showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const displayName = useCallback(
    (u: User) => {
      const id = u._id || u.id || "";
      return details[id]?.name || u.name || u.username;
    },
    [details],
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [displayName(u), u.username, u.email].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [users, query, displayName]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateUserRequest | UpdateUserRequest,
  ) => {
    try {
      setActionLoading(true);
      if (selectedUser) {
        await userService.updateUser(
          selectedUser._id || selectedUser.id || "",
          data,
        );
        showSuccess("User updated successfully");
      } else {
        await userService.createUser(data as CreateUserRequest);
        showSuccess("User created successfully");
      }
      setFormOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save user";
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setActionLoading(true);
      await userService.deleteUser(userToDelete._id || userToDelete.id || "");
      showSuccess("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete user";
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const rowMenu = (user: User): ActionMenuItem[] => {
    const userId = user._id || user.id || "";
    const isSelf = Boolean(currentUser?.id) && userId === currentUser?.id;
    return [
      {
        label: "View Details",
        icon: <Visibility fontSize="small" />,
        onClick: () => navigate(`/users/${userId}`),
      },
      {
        label: "Edit",
        icon: <Edit fontSize="small" />,
        onClick: () => handleEditUser(user),
        hidden: !isAdmin,
        disabled: actionLoading,
      },
      {
        label: "Delete",
        icon: <Delete fontSize="small" />,
        color: "error",
        dividerBefore: true,
        hidden: !isAdmin,
        disabled: actionLoading || isSelf,
        disabledHint: isSelf ? "Cannot delete your own account" : undefined,
        onClick: () => handleDeleteUser(user),
      },
    ];
  };

  // ── Cells ────────────────────────────────────────────────────────────────
  const CompletionCell = ({ id }: { id: string }) => {
    const info = details[id];
    if (!info) {
      return enriching ? (
        <Skeleton variant="rounded" width={120} height={8} sx={{ borderRadius: 4 }} />
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      );
    }
    if (info.completion == null) {
      return (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      );
    }
    return (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 150 }}>
        <LinearProgress
          variant="determinate"
          value={info.completion}
          color={completionColor(info.completion)}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 34, textAlign: "right" }}>
          {info.completion}%
        </Typography>
      </Stack>
    );
  };

  const StatusCell = ({ id }: { id: string }) => {
    const info = details[id];
    if (!info) {
      return enriching ? (
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: 999 }} />
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      );
    }
    return info.verified ? (
      <Chip
        icon={<Verified sx={{ fontSize: 14 }} />}
        label="Verified"
        size="small"
        color="success"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    ) : (
      <Chip label="Pending" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
    );
  };

  if (error && users.length === 0 && !loading) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <ResponsiveButton icon={<Add />} onClick={fetchUsers}>
          Retry
        </ResponsiveButton>
      </Box>
    );
  }

  return (
    <>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "flex-end" },
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Manage users and their permissions" : "Browse the users list"}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexShrink: 0 }}>
          <TextField
            size="small"
            placeholder="Search users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": { borderRadius: 999 },
            }}
          />
          {isAdmin && (
            <ResponsiveButton collapseBreakpoint="sm" icon={<Add />} onClick={handleCreateUser}>
              Add User
            </ResponsiveButton>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Desktop / tablet: table ── */}
      <TableContainer
        component={Paper}
        sx={{ display: { xs: "none", md: "block" }, overflow: "hidden" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Completion</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box>
                        <Skeleton variant="text" width={140} />
                        <Skeleton variant="text" width={90} />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><Skeleton variant="rounded" width={64} height={24} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={140} height={8} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={78} height={24} /></TableCell>
                  <TableCell align="right"><Skeleton variant="circular" width={28} height={28} sx={{ ml: "auto" }} /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    {query ? "No users match your search." : "No users found."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const id = user._id || user.id || "";
                const name = displayName(user);
                const jobRole = details[id]?.jobRole;
                const isAdminRole = user.role === "admin";
                return (
                  <TableRow
                    key={id}
                    hover
                    onClick={() => navigate(`/users/${id}`)}
                    sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: 15,
                            fontWeight: 700,
                            bgcolor: (t) =>
                              isAdminRole
                                ? t.palette.primary.main
                                : alpha(t.palette.primary.main, 0.14),
                            color: (t) =>
                              isAdminRole ? t.palette.primary.contrastText : t.palette.primary.main,
                          }}
                        >
                          {HelperFunctions.getInitials(name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                            {jobRole || user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={HelperFunctions.formatRole(user.role)}
                        size="small"
                        color={isAdminRole ? "primary" : "default"}
                        variant={isAdminRole ? "filled" : "outlined"}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <CompletionCell id={id} />
                    </TableCell>
                    <TableCell>
                      <StatusCell id={id} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu items={rowMenu(user)} tooltip="Actions" />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Mobile: card grid ── */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {loading ? (
          <SkeletonLoader count={4} showActions={isAdmin} />
        ) : filteredUsers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
            {query ? "No users match your search." : "No users found."}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} key={user._id || user.id}>
                <UserCard
                  user={user}
                  isAdmin={isAdmin}
                  currentUserId={currentUser?.id}
                  actionLoading={actionLoading}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <UserForm
        open={formOpen}
        user={selectedUser}
        onClose={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.username || userToDelete?.name || "this user"}?`}
        loading={actionLoading}
        confirmColor="error"
        onCancel={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default UsersPage;
