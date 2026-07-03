/**
 * UserCard Component
 * Users listing card built on the common EntityCard.
 */

import { Visibility, Edit, Delete, MailOutline, AlternateEmail } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { EntityCard, type ActionMenuItem } from "@/common/components";
import type { User } from "../services/userService";

interface UserCardProps {
  user: User;
  isAdmin: boolean;
  currentUserId?: string;
  actionLoading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserCard = ({
  user,
  isAdmin,
  currentUserId,
  actionLoading = false,
  onEdit,
  onDelete,
}: UserCardProps) => {
  const navigate = useNavigate();

  const userId = user._id || user.id || "";
  const displayName = user.username || user.name || "Unknown user";
  const isSelf = Boolean(currentUserId) && userId === currentUserId;
  const isAdminRole = user.role === "admin";

  const goToDetail = () => navigate(`/users/${userId}`);

  const menuItems: ActionMenuItem[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: goToDetail,
    },
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: () => onEdit(user),
      hidden: !isAdmin,
      disabled: actionLoading,
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      color: "error",
      dividerBefore: true,
      hidden: !isAdmin,
      disabled: actionLoading || isSelf,
      disabledHint: isSelf ? "Cannot delete your own account" : undefined,
      onClick: () => onDelete(user),
    },
  ];

  return (
    <EntityCard
      title={displayName}
      avatarText={displayName.charAt(0).toUpperCase()}
      avatarVariant={isAdminRole ? "filled" : "tinted"}
      headerChip={{
        label: user.role || "user",
        color: isAdminRole ? "primary" : "default",
        variant: isAdminRole ? "filled" : "outlined",
      }}
      info={[
        { icon: <MailOutline fontSize="small" />, text: user.email },
        ...(user.username
          ? [{ icon: <AlternateEmail fontSize="small" />, text: user.username }]
          : []),
      ]}
      actions={menuItems}
      onClick={goToDetail}
    />
  );
};
