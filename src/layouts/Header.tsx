/**
 * Header Component
 * Application header with navigation and profile menu
 */

import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { useAuth } from "@/contexts";
import { ProfileMenu } from "./ProfileMenu";
import { Link } from "react-router-dom";
import { SidebarIcon } from "lucide-react"; // Swapped for a cohesive Lucide look
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
      elevation={0} // Flattens look; depth is managed below with border
      sx={{
        top: 0,
        borderBottom: "1px solid",
        borderColor: (theme) => theme.palette.divider,
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
            borderRadius: 1,
            border: "1px solid",
            borderColor: (theme) => theme.palette.action.hover,
            transition: (theme) =>
              theme.transitions.create(["background-color", "border-color"]),
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
              borderColor: (theme) => theme.palette.divider,
            },
          }}
        >
          <SidebarIcon size={20} strokeWidth={2} />
        </IconButton>

        <Typography
          variant="subtitle1"
          fontWeight={600}
          component={Link}
          to={ROUTES.PERSONAL_DETAILS}
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            letterSpacing: "-0.01em",
            "&:hover": {
              opacity: 0.85,
            },
          }}
        >
          Profile Manager
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {isAuthenticated && <ProfileMenu />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
