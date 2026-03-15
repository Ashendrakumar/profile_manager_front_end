/**
 * NavigationItems Component
 * Navigation buttons for the header
 */

import { Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
// import { ROUTES } from '@/constants';

interface NavigationItem {
  label: string;
  path: string;
}

interface NavigationItemsProps {
  items: NavigationItem[];
}

/**
 * Navigation Items Component
 */
export const NavigationItems = ({ items }: NavigationItemsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {items.map((item) => {
        // Check if the current path matches the navigation item
        // For root path '/', match exactly
        // For other paths, check if pathname starts with the path (for nested routes)
        const isActive =
          item.path === "/"
            ? location.pathname === item.path
            : location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

        return (
          <Button
            key={item.path}
            color="inherit"
            onClick={() => navigate(item.path)}
            sx={{
              backgroundColor: isActive
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
};
