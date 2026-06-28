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
import {
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle,
} from "@mui/icons-material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useThemeMode, useAuth } from "@/contexts";
import { profileService } from "@/modules/profile";
import type { User } from "@/modules/auth";

/**
 * Profile Menu Component
 */
export const ProfileMenu = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { logout, user, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    console.log("user", user);
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handlePortfolio = async (isGenerated: boolean) => {
    handleMenuClose();
    if (isGenerated) return;
    const response = await profileService.generatePortfolioLink();
    if (!response.data.link) return;
    const updatedUser = {
      ...user,
      portfolio: {
        link: response.data.link,
        isGenerated: true,
      },
    };
    updateUser(updatedUser as User);

    window.open(response.data.link, "_blank");
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMenuClose();
  };

  return (
    <>
      <Button
        id="profile-button"
        startIcon={<AccountCircle />}
        onClick={handleProfileClick}
        color="inherit"
        size="medium"
        aria-label="profile"
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{
          display: {
            xs: "inline-block",
            sm: "inline-block",
            md: "flex",
          },
          alignItems: "center",
          gap: 0,
        }}
      >
        <Box
          sx={{
            display: {
              sm: "none",
              xs: "none",
              md: "inline-block",
            },
          }}
        >
          <Typography
            sx={{ fontWeight: "500", margin: 0, lineHeight: 1 }}
            variant="body1"
          >
            {user?.name.slice(0, 8)}
          </Typography>
          <Typography
            sx={{ margin: 0, lineHeight: 1, textAlign: "left" }}
            variant="subtitle2"
          >
            {user?.role}
          </Typography>
        </Box>
      </Button>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {user && (
          <>
            <MenuItem aria-readonly={true} disabled>
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>{user.name}</Typography>
                <Typography variant="subtitle2">{user.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem
          onClick={() => handlePortfolio(user?.portfolio?.isGenerated ?? false)}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          {user!.portfolio?.isGenerated ? (
            <ListItemText>
              <a
                href={user?.portfolio?.link}
                style={{ textDecoration: "none", color: "inherit" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {"View Portfolio"}
              </a>
            </ListItemText>
          ) : (
            <ListItemText>{"Get Portfolio"}</ListItemText>
          )}
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>User Info</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {mode === "light" ? (
              <Brightness4 fontSize="small" />
            ) : (
              <Brightness7 fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {" "}
            {mode === "light" ? "Dark" : "Light"} Mode
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.light" }}>
          <ListItemIcon sx={{ color: "error.light" }}>
            <Logout color="inherit" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
