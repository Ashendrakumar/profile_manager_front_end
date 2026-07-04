/**
 * ResponsiveButton
 * A Button that shows icon + label on larger screens, and collapses to an
 * icon-only button (correct padding/tap-target via IconButton) on mobile.
 *
 * Usage:
 *   <ResponsiveButton icon={<Add />} onClick={handleAdd}>
 *     Add
 *   </ResponsiveButton>
 *
 *   <ResponsiveButton
 *     icon={<Delete />}
 *     color="error"
 *     variant="outlined"
 *     collapseBreakpoint="md"
 *     onClick={handleDelete}
 *   >
 *     Delete
 *   </ResponsiveButton>
 */

import type { ReactNode } from "react";

import Button, { type ButtonProps } from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Breakpoint } from "@mui/material/styles";

// ----------------------------------------------------------------------

type ResponsiveButtonProps = {
  icon: ReactNode;
  children: ReactNode;
  collapseBreakpoint?: Breakpoint;
  showTooltipWhenCollapsed?: boolean;
} & Omit<ButtonProps, "children">;

export function ResponsiveButton({
  icon,
  children,
  collapseBreakpoint = "sm",
  showTooltipWhenCollapsed = true,
  onClick,
  type = "button",
  color = "primary",
  variant = "contained",
  ...buttonProps
}: ResponsiveButtonProps) {
  const theme = useTheme();
  const isCollapsed = useMediaQuery(theme.breakpoints.down(collapseBreakpoint));

  if (isCollapsed) {
    const button = (
      <Button
        variant={variant}
        onClick={onClick}
        color={color}
        {...buttonProps}
      >
        {icon}
      </Button>
    );

    if (!showTooltipWhenCollapsed) return button;

    return <Tooltip title={children}>{button}</Tooltip>;
  }

  return (
    <Button
      variant={variant}
      startIcon={icon}
      onClick={onClick}
      color={color}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
