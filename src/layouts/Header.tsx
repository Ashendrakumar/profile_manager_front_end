/**
 * Header Component
 * Application header with navigation and profile menu
 */

import { AppBar, Toolbar, Box, IconButton, alpha } from "@mui/material";
import { useAuth } from "@/contexts";
import { ProfileMenu } from "./ProfileMenu";
import { Link } from "react-router-dom";
import { SidebarIcon } from "lucide-react"; // Swapped for a cohesive Lucide look
import { BrandMark } from "@/common/components";
import { ROUTES } from "@/constants";

interface HeaderProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header = ({ setOpen }: HeaderProps) => {
  const { isAuthenticated } = useAuth();

  const handleIsOpen = () => {
    setOpen((prev: boolean) => !prev);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0} // Flat; depth comes from the border + backdrop blur below
      color="transparent"
      sx={{
        top: 0,
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        // Glassy translucent surface over the scrolling content.
        backgroundColor: (theme) =>
          alpha(
            theme.palette.background.paper,
            theme.palette.mode === "dark" ? 0.72 : 0.8,
          ),
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={handleIsOpen}
          edge="start"
          size="small"
          sx={{
            marginRight: 2,
            p: 1,
            borderRadius: 1.5,
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            transition: (theme) =>
              theme.transitions.create([
                "background-color",
                "border-color",
                "color",
              ]),
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
              borderColor: "primary.main",
              color: "primary.main",
            },
          }}
        >
          <SidebarIcon size={20} strokeWidth={2} />
        </IconButton>

        <Box
          component={Link}
          to={ROUTES.PROFILE}
          sx={{
            flexGrow: 1,
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            transition: (theme) => theme.transitions.create("opacity"),
            "&:hover": {
              opacity: 0.85,
            },
          }}
        >
          <BrandMark variant="default" size={32} />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {isAuthenticated && <ProfileMenu />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
