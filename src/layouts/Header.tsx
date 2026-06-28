/**
 * Header Component
 * Application header with navigation and profile menu
 */

import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { useAuth } from "@/contexts";
import { ProfileMenu } from "./ProfileMenu";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

interface HeaderProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Header Component
 */
export const Header = ({ setOpen }: HeaderProps) => {
  const { isAuthenticated } = useAuth();

  const handleIsOpen = () => {
    setOpen((prev: boolean) => !prev);
  };

  return (
    <AppBar
      position="sticky"
      color="primary"
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        top: 0,
        // zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleIsOpen}
          edge="start"
          sx={[
            {
              marginRight: 2,
            },
          ]}
        >
          <MenuIcon />
        </IconButton>
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
          {isAuthenticated && <ProfileMenu />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
