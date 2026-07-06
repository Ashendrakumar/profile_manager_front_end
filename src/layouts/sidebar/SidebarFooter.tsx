import { Box, Typography, Tooltip, Divider } from "@mui/material";
import { useAuth } from "@/contexts";
import { UserAvatar } from "../UserAvatar";
import { HelperFunctions } from "@/utils/helpers";

type SidebarFooterProps = {
  isCollapsed: boolean;
};

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const { user } = useAuth();

  if (!user) return null;

  const role = HelperFunctions.formatRole(user.role);

  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.25,
        py: 1.25,
        justifyContent: isCollapsed ? "center" : "flex-start",
        overflow: "hidden",
      }}
    >
      <UserAvatar />

      {!isCollapsed && (
        <Box sx={{ overflow: "hidden", minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{ fontSize: 13.5, lineHeight: 1.3 }}
          >
            {user.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: 11.5, display: "block", lineHeight: 1.3 }}
          >
            {role}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexShrink: 0, mt: "auto" }}>
      <Divider />
      {isCollapsed ? (
        <Tooltip title={`${user.name} · ${role}`} placement="right" arrow>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  );
}
