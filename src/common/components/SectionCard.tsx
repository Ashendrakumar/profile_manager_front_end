/**
 * SectionCard — the design system's "Grouped list" primitive.
 *
 * A titled card with a count chip in the header and a body that is either a
 * list rendered from `items` via `renderItem`, or any custom `children` (a
 * dense grid, a chip cloud, …). Static by default (no hover); the rows inside
 * can be interactive on their own. Reusable across profile/section screens.
 */

import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  Chip,
  Divider,
  CardContent,
  List,
  Stack,
} from "@mui/material";

type SectionCardProps<T> = {
  title: string;
  /** Defaults to `items.length` when a list body is used. */
  count?: number;
  icon?: ReactNode;
  chipColor?: "success" | "warning" | "primary" | "info" | "default";
  /** Extra header control, e.g. an add button. Sits left of the count chip. */
  action?: ReactNode;
  items?: T[];
  renderItem?: (item: T) => ReactNode;
  /** Custom body. Takes precedence over `items` / `renderItem`. */
  children?: ReactNode;
};

export const SectionCard = <T,>({
  title,
  count,
  icon,
  chipColor = "primary",
  action,
  items,
  renderItem,
  children,
}: SectionCardProps<T>) => (
  <Card elevation={0} sx={{ height: "100%" }}>
    <CardHeader
      avatar={icon}
      title={title}
      titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={count ?? items?.length ?? 0}
            size="small"
            color={chipColor}
            sx={{ fontWeight: 600 }}
          />
          {action}
        </Stack>
      }
      sx={{ pb: 1.5, "& .MuiCardHeader-action": { alignSelf: "center", m: 0 } }}
    />

    <Divider />

    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      {children ??
        (items && renderItem ? (
          <List disablePadding>{items.map(renderItem)}</List>
        ) : null)}
    </CardContent>
  </Card>
);
