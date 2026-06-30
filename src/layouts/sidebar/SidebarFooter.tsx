import { Box, Avatar, Typography, Tooltip, Divider } from "@mui/material";
import { useAuth } from "@/contexts";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatRole(role?: string | null): string {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

type SidebarFooterProps = {
  isCollapsed: boolean;
};

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const { user } = useAuth();

  if (!user) return null;

  const initials = getInitials(user.name);
  const role = formatRole(user.role);

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
      <Avatar
        src={user.avatarUrl as string}
        sx={{
          width: 32,
          height: 32,
          minWidth: 32,
          fontSize: 12.5,
          fontWeight: 600,
          bgcolor: (theme) => theme.palette.primary?.[50],
          color: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.primary?.[100]
              : theme.palette.primary?.[700],
        }}
      >
        {initials}
      </Avatar>

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
