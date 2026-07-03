/**
 * UsersPage Component
 * Displays a list of users with admin management features
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Fixed: Added missing Link import
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  IconButton,
  Chip,
  CardActions,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useMetadata } from "@/hooks";
import { useAuth } from "@/contexts";
import { useToast } from "@/contexts/toastContext";
import { userService } from "../services/userService";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../services/userService";
import { LoadingSpinner, ConfirmDialog } from "@/common/components";
import { UserForm } from "../components/UserForm";
import { EyeIcon } from "lucide-react";

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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
            disabled={actionLoading}
          >
            Add
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id || user.id}>
            <Card
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {user.username || user.name}
                  </Typography>
                  <Chip
                    label={user.role || "user"}
                    color={user.role === "admin" ? "primary" : "default"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </CardContent>
              {isAdmin && (
                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditUser(user)}
                    disabled={actionLoading}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="info"
                    component={Link} // Fixed: Changed LinkComponent to component
                    to={`/users/${user._id || user.id}`} // Fixed: Assumed standard string interpolation path
                    disabled={actionLoading}
                  >
                    <EyeIcon size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user)}
                    disabled={
                      actionLoading ||
                      user._id === currentUser?.id ||
                      user.id === currentUser?.id
                    }
                    title={
                      user._id === currentUser?.id ||
                      user.id === currentUser?.id
                        ? "Cannot delete your own account"
                        : "Delete user"
                    }
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {users.length === 0 && (
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
