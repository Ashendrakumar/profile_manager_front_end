/**
 * SectionCard — the design system's "Grouped list" primitive.
 *
 * A titled card with a count chip in the header and a list body rendered from
 * `items` via `renderItem`. Static by default (no hover); the rows inside can
 * be interactive on their own. Reusable across profile/section screens.
 */

import {
  Card,
  CardHeader,
  Chip,
  Divider,
  CardContent,
  List,
} from "@mui/material";

type SectionCardProps<T> = {
  title: string;
  count: number;
  icon: React.ReactNode;
  chipColor: "success" | "warning";
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

export const SectionCard = <T,>({
  title,
  count,
  icon,
  chipColor,
  items,
  renderItem,
}: SectionCardProps<T>) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
    }}
  >
    <CardHeader
      avatar={icon}
      title={title}
      action={
        <Chip
          label={count}
          size="small"
          color={chipColor}
          sx={{ fontWeight: 600 }}
        />
      }
      sx={{ pb: 1 }}
    />

    <Divider />

    <CardContent sx={{ p: 1.5 }}>
      <List disablePadding>{items.map(renderItem)}</List>
    </CardContent>
  </Card>
);
