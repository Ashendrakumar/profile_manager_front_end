/**
 * UsersPage Component
 * Displays a list of users with admin management features
 */

import { useState, useEffect } from "react";
import { Typography, Box, Grid, Alert, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
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
} from "@/common/components";
import { UserForm } from "../components/UserForm";
import { UserCard } from "../components/UserCard";

/**
 * Users page component
 */
const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // Set page metadata
  useMetadata({
    title: "Users - Profile Manager",
    description: "Browse and manage users",
    keywords: "users, manage, list",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      showError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        // Update user
        await userService.updateUser(
          selectedUser._id || selectedUser.id || "",
          data,
        );
        showSuccess("User updated successfully");
      } else {
        // Create user
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

  if (error && users.length === 0) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUsers}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin
              ? "Manage users and their permissions"
              : "Browse our users list"}
          </Typography>
        </Box>
        {isAdmin && (
          <ResponsiveButton
            collapseBreakpoint="sm"
            icon={<Add />}
            onClick={handleCreateUser}
          >
            Add
          </ResponsiveButton>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && <SkeletonLoader count={6} showActions={isAdmin} />}

      {!loading && (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id || user.id}>
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

      {!loading && users.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No users found
          </Typography>
        </Box>
      )}

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

      {/* Fixed: Added missing ConfirmDialog implementation */}
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
