import { useAuth } from "@/contexts";
import { HelperFunctions } from "@/utils/helpers";
import { Avatar } from "@mui/material";

export const UserAvatar = () => {
  const { user } = useAuth();
  const initials = HelperFunctions.getInitials(user?.name);

  return (
    <Avatar
      src={user?.avatarUrl as string}
      sx={{
        width: 32,
        height: 32,
        minWidth: 32,
        fontSize: 12.5,
        fontWeight: 600,
        bgcolor: (theme) => (theme.palette.primary as any)?.["50"],
        color: (theme) =>
          theme.palette.mode === "dark"
            ? (theme.palette.primary as any)?.[100]
            : (theme.palette.primary as any)?.[700],
      }}
    >
      {initials}
    </Avatar>
  );
};
