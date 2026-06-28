import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import { NavLink } from "react-router-dom";
import { sidebarMenus } from "./menu";
import { DIMENSIONS } from "@/constants";
import { useAuth } from "@/contexts";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  isCollapsed: boolean;
};

export default function Sidebar({
  open,
  setOpen,
  isMobile,
  isCollapsed,
}: SidebarProps) {
  const { isAuthenticated, user } = useAuth();
  const allNavigationItems = sidebarMenus;

  const navigationItems = isAuthenticated
    ? allNavigationItems.filter((item) => {
        if (item.adminOnly) {
          return user?.role === "admin";
        }
        return true;
      })
    : [];

  return (
    <Drawer
      open={open}
      variant={isMobile ? "temporary" : "permanent"}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          backgroundColor: "theme.palette.background.default",
          borderRight: "none",
          borderRadius: 0,
          flexShrink: 0,
          width: isCollapsed
            ? DIMENSIONS.SIDE_BAR_WIDTH_ICON
            : DIMENSIONS.SIDE_BAR_WIDTH,
          top: DIMENSIONS.HEADER_HEIGHT + "px",
          transition: "width 0.3s ease-in-out",
          height: `calc(100dvh - ${DIMENSIONS.HEADER_HEIGHT}px)`,
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        },
      }}
    >
      <List>
        {navigationItems.map((menu) => {
          const Icon = menu.icon;

          return (
            <ListItemButton
              key={menu.path}
              component={NavLink}
              to={menu.path}
              onClick={() => {
                if (isMobile) {
                  setOpen(false);
                }
              }}
              sx={{
                mx: 0,
                my: 0,
                borderRadius: 0,
                borderRight: "4px solid",
                borderColor: "transparent",
                transition: "all 0.3s ease-in-out",
                "&.active": {
                  borderRight: "4px solid",
                  borderColor: "primary.main",
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}20 50%, ${theme.palette.primary.light}10 100%)`,
                },
              }}
            >
              {isCollapsed ? (
                <Tooltip title={menu.title} placement="right" arrow>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                </Tooltip>
              ) : (
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
              )}
              <ListItemText
                sx={{ visibility: isCollapsed ? "hidden" : "visible" }}
                primary={menu.title}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
