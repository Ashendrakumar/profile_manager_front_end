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
import { SidebarFooter } from "./SidebarFooter";

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
        {navigationItems.map((menu: any) => {
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
                mx: 0.5,
                mb: 0.25,
                py: 1.25,
                px: 1.25,
                borderRadius: 1,
                color: "text.primary",
                display: "flex",
                position: "relative",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: "action.hover",
                },

                "& .MuiListItemIcon-root": {
                  color: "inherit",
                  minWidth: isCollapsed ? "auto" : 36,
                  width: 36,
                  display: "flex",
                  justifyContent: "center",
                  transition: "color 0.15s ease",
                },

                "& .MuiListItemText-primary": {
                  fontSize: 14,
                  fontWeight: 400,
                  transition: "color 0.15s ease, font-weight 0.15s ease",
                },

                "&.active": {
                  backgroundColor: (theme) => theme.palette.primary[50],
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.primary[100]
                      : theme.palette.primary[700],

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 3,
                    borderRadius: "0 3px 3px 0",
                    backgroundColor: (theme) => theme.palette.primary[400],
                  },

                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.primary[50],
                  },

                  "& .MuiListItemText-primary": {
                    fontWeight: 500,
                  },
                },
              }}
            >
              {isCollapsed ? (
                <Tooltip title={menu.title} placement="right" arrow>
                  <ListItemIcon>
                    <Icon size={19} />
                  </ListItemIcon>
                </Tooltip>
              ) : (
                <ListItemIcon>
                  <Icon size={19} />
                </ListItemIcon>
              )}
              <ListItemText
                sx={{ visibility: isCollapsed ? "hidden" : "visible", my: 0 }}
                primary={menu.title}
              />
            </ListItemButton>
          );
        })}
      </List>
      <SidebarFooter isCollapsed={isCollapsed} />
    </Drawer>
  );
}
