/**
 * ProfileMenu Component
 * User profile menu with theme toggle and logout
 */

import { useState } from "react";
import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { User, Sun, Moon, ExternalLink, Sparkles, LogOut } from "lucide-react"; // Integrated Lucide React

import { useThemeMode, useAuth } from "@/contexts";
import { profileService } from "@/modules/profile";
import type { User as UserType } from "@/modules/auth";

export const ProfileMenu = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { logout, user, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handlePortfolioAction = async () => {
    handleMenuClose();

    // If link is already generated, just open it in a new window
    if (user?.portfolio?.isGenerated && user?.portfolio?.link) {
      window.open(user.portfolio.link, "_blank", "noopener,noreferrer");
      return;
    }

    // Generate link if it does not exist yet
    const response = await profileService.generatePortfolioLink();
    if (!response?.data?.link) return;

    const updatedUser = {
      ...user,
      portfolio: {
        link: response.data.link,
        isGenerated: true,
      },
    };
    updateUser(updatedUser as UserType);
    window.open(response.data.link, "_blank", "noopener,noreferrer");
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMenuClose();
  };

  return (
    <>
      <Button
        id="profile-button"
        onClick={handleProfileClick}
        color="inherit"
        aria-label="profile menu"
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{
          textTransform: "none",
          p: 0.75,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          transition: (theme) => theme.transitions.create("background-color"),
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        }}
      >
        {/* Modern Framed Profile Thumbnail Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 1.5,
            backgroundColor: (theme) => theme.palette.action.selected,
            color: (theme) => theme.palette.primary.contrastText,
          }}
        >
          <User size={18} strokeWidth={2.2} />
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "none", md: "block" },
            textAlign: "left",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {user?.name
              ? user.name.length > 12
                ? `${user.name.slice(0, 10)}...`
                : user.name
              : "Guest"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              textTransform: "capitalize",
              display: "block",
              mt: 0.2,
            }}
          >
            {user?.role || "User"}
          </Typography>
        </Box>
      </Button>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 220,
              mt: 1,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            },
          },
        }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary"
              noWrap
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block" }}
            >
              {user.email}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Unified actionable menu choice container */}
        <MenuItem onClick={handlePortfolioAction} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ color: "text.secondary" }}>
            {user?.portfolio?.isGenerated ? (
              <ExternalLink size={16} />
            ) : (
              <Sparkles size={16} />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              user?.portfolio?.isGenerated ? "View Portfolio" : "Get Portfolio"
            }
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>

        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ color: "text.secondary" }}>
            <User size={16} />
          </ListItemIcon>
          <ListItemText
            primary="User Info"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>

        <MenuItem onClick={handleThemeToggle} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ color: "text.secondary" }}>
            {mode === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </ListItemIcon>
          <ListItemText
            primary={`${mode === "light" ? "Dark" : "Light"} Mode`}
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: "error.main",
            "&:hover": { backgroundColor: "error.lighter" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogOut size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};
