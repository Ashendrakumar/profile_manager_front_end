/**
 * UserDetailPage Component
 * Displays detailed information about a user
 */

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button,
  Container,
  Chip,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useMetadata } from "@/hooks";
import { userService } from "../services/userService";
// import type { User } from "../services/userService";
import { SkeletonLoader } from "@/common/components";

/**
 * User detail page component
 */
const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set page metadata
  useMetadata({
    title: user
      ? `${user.name} - User Details`
      : "User Details - Profile Manager",
    description: user ? `View details for ${user.name}` : "View user details",
    keywords: "user, details, profile",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <SkeletonLoader variant="detail" lines={8} />
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "User not found"}
        </Alert>
        <Button
          variant="contained"
          size="medium"
          onClick={() => navigate("/users")}
        >
          Back to Users
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        variant="outlined"
        size="medium"
        onClick={() => navigate("/users")}
        sx={{ mb: 3 }}
      >
        ← Back to Users
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {user.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            @{user.username}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            {user.phone && (
              <Typography variant="body1">
                <strong>Phone:</strong> {user.phone}
              </Typography>
            )}
            {user.website && (
              <Typography variant="body1">
                <strong>Website:</strong> {user.website}
              </Typography>
            )}
          </Box>

          {user.address && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Typography variant="body1">
                {user.address.street}, {user.address.suite}
              </Typography>
              <Typography variant="body1">
                {user.address.city}, {user.address.zipcode}
              </Typography>
            </>
          )}

          {user.company && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Company
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{user.company.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {user.company.catchPhrase}
              </Typography>
              <Chip label={user.company.bs} size="small" />
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserDetailPage;
