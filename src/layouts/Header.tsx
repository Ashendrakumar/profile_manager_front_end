/**
 * Header Component
 * Application header with navigation and profile menu
 */

import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { ROUTES } from "@/constants";
import { useAuth } from "@/contexts";
import { NavigationItems } from "./NavigationItems";
import { ProfileMenu } from "./ProfileMenu";
import { Link } from "react-router-dom";

const allNavigationItems = [
  // { label: "Home", path: ROUTES.HOME, adminOnly: false },
  { label: "About", path: ROUTES.ABOUT, adminOnly: false },
  { label: "Profile", path: ROUTES.PROFILE, adminOnly: false },
  { label: "Users", path: ROUTES.USERS, adminOnly: true },
];

interface HeaderProps {
  isAuthPage: boolean;
}

/**
 * Header Component
 */
export const Header = ({ isAuthPage }: HeaderProps) => {
  const { isAuthenticated, user } = useAuth();

  // Filter navigation items based on user role
  const navigationItems = isAuthenticated
    ? allNavigationItems.filter((item) => {
        if (item.adminOnly) {
          return user?.role === "admin";
        }
        return true;
      })
    : [];

  if (isAuthPage) {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      color="primary"
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Profile Manager
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isAuthenticated && (
            <>
              <NavigationItems items={navigationItems} />
              <ProfileMenu />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
