/**
 * ActionMenu Component
 * Reusable "kebab" (3-dot) action menu with the same appearance as the
 * header profile menu. Driven by a declarative list of items so it can be
 * dropped onto cards, list rows, table cells, etc.
 */

import { useState, type ReactNode, type MouseEvent } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Box,
  alpha,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** `error` renders a destructive (red) item. */
  color?: "default" | "error";
  disabled?: boolean;
  /** Tooltip / hint when the item is disabled. */
  disabledHint?: string;
  /** Render a divider above this item. */
  dividerBefore?: boolean;
  /** Hide the item entirely. */
  hidden?: boolean;
};

export type ActionMenuProps = {
  items: ActionMenuItem[];
  /** Custom trigger icon (defaults to a 3-dot MoreVert icon). */
  icon?: ReactNode;
  /** Tooltip for the trigger button. */
  tooltip?: string;
  size?: "small" | "medium";
  ariaLabel?: string;
  disabled?: boolean;
  minWidth?: number;
  /** Optional content rendered at the top of the menu (e.g. a title block). */
  header?: ReactNode;
};

export const ActionMenu = ({
  items,
  icon,
  tooltip,
  size = "small",
  ariaLabel = "actions",
  disabled = false,
  minWidth = 100,
  header,
}: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: {}) => {
    (event as MouseEvent | undefined)?.stopPropagation?.();
    setAnchorEl(null);
  };

  const handleItemClick = (event: MouseEvent, item: ActionMenuItem) => {
    event.stopPropagation();
    setAnchorEl(null);
    item.onClick?.();
  };

  const visibleItems = items.filter((item) => !item.hidden);

  const trigger = (
    <IconButton
      aria-label={ariaLabel}
      aria-haspopup="true"
      aria-expanded={open ? "true" : undefined}
      size={size}
      disabled={disabled}
      onClick={handleOpen}
    >
      {icon ?? <MoreVert fontSize={size} />}
    </IconButton>
  );

  return (
    <>
      {tooltip ? <Tooltip title={tooltip}>{trigger}</Tooltip> : trigger}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth,
              mt: 1,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            },
          },
        }}
      >
        {header && (
          <Box sx={{ px: 1.5, py: 1 }}>
            {header}
            <Divider sx={{ mt: 1, mx: -0.5 }} />
          </Box>
        )}

        {visibleItems.flatMap((item, index) => {
          const isError = item.color === "error";
          const nodes: ReactNode[] = [];

          if (item.dividerBefore && index > 0) {
            nodes.push(
              <Divider key={`${item.label}-divider`} sx={{ my: 0.5 }} />,
            );
          }

          const menuItem = (
            <MenuItem
              key={item.label}
              onClick={(e) => handleItemClick(e, item)}
              disabled={item.disabled}
              sx={{
                borderRadius: 1,
                ...(isError && {
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.error.main, 0.08),
                  },
                }),
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{ color: isError ? "inherit" : "text.secondary" }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </MenuItem>
          );

          if (item.disabled && item.disabledHint) {
            nodes.push(
              <Tooltip
                key={`${item.label}-tooltip`}
                title={item.disabledHint}
                placement="left"
              >
                {/* span wrapper so the tooltip works on a disabled item */}
                <span>{menuItem}</span>
              </Tooltip>,
            );
          } else {
            nodes.push(menuItem);
          }

          return nodes;
        })}
      </Menu>
    </>
  );
};
