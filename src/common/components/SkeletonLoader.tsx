/**
 * SkeletonLoader Component
 * Generic, reusable skeleton placeholder for listing/detail pages.
 * Renders a responsive grid of card skeletons, a stacked list, or a
 * single detail block while data is loading.
 */

import {
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  Skeleton,
} from "@mui/material";

export type SkeletonLoaderProps = {
  /** Visual shape of each placeholder. Defaults to `card`. */
  variant?: "card" | "list" | "detail" | "grouped";
  /** Number of placeholder items to render (ignored for `detail`). */
  count?: number;
  /**
   * Min width (px) of each item in the responsive grid. For `card` that is the
   * card itself; for `grouped` it is the tile inside each group card.
   */
  minItemWidth?: number;
  /** Tiles rendered inside each group card (`grouped` variant). */
  itemsPerGroup?: number;
  /** Number of body text lines per item. */
  lines?: number;
  /** Render action-button placeholders (card footer / list trailing icons). */
  showActions?: boolean;
  /** Gap between items, in MUI spacing units. */
  gap?: number;
  /** MUI sx prop. */
  sx?: any;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const CardSkeleton = ({
  lines,
  showActions,
}: {
  lines: number;
  showActions: boolean;
}) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Skeleton variant="text" width="55%" height={32} />
        <Skeleton variant="rounded" width={56} height={24} />
      </Box>
      {range(lines).map((i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "40%" : "100%"}
        />
      ))}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={90} height={24} />
        <Skeleton variant="rounded" width={70} height={24} />
      </Box>
    </CardContent>
    {showActions && (
      <CardActions>
        <Skeleton variant="circular" width={30} height={30} />
        <Skeleton variant="circular" width={30} height={30} />
        <Skeleton variant="circular" width={30} height={30} />
      </CardActions>
    )}
  </Card>
);

const ListItemSkeleton = ({
  lines,
  showActions,
}: {
  lines: number;
  showActions: boolean;
}) => (
  <Card>
    <CardContent
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        "&:last-child": { pb: 2 },
      }}
    >
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="35%" height={26} />
        {range(lines).map((i) => (
          <Skeleton key={i} variant="text" width={i === 0 ? "70%" : "50%"} />
        ))}
      </Box>
      {showActions && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
        </Box>
      )}
    </CardContent>
  </Card>
);

/** Mirrors a `SkillTile`: name + kebab, caption, slim proficiency bar. */
const TileSkeleton = () => (
  <Box
    sx={{
      px: 1.5,
      py: 1.25,
      border: 1,
      borderColor: "divider",
      borderRadius: "8px",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Skeleton variant="text" width="65%" height={22} sx={{ flex: 1 }} />
      <Skeleton variant="circular" width={20} height={20} />
    </Box>
    <Skeleton variant="text" width="45%" height={16} />
    <Skeleton variant="rounded" height={3} sx={{ mt: 1, borderRadius: 999 }} />
  </Box>
);

/** Mirrors a `SectionCard` holding a dense tile grid (the Skills pattern). */
const GroupSkeleton = ({
  items,
  minItemWidth,
}: {
  items: number;
  minItemWidth: number;
}) => (
  <Card>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width="35%" height={26} />
      </Box>
      <Skeleton variant="rounded" width={28} height={22} />
    </Box>

    <Divider />

    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
          gap: 1.5,
        }}
      >
        {range(items).map((i) => (
          <TileSkeleton key={i} />
        ))}
      </Box>
    </CardContent>
  </Card>
);

const DetailSkeleton = ({ lines }: { lines: number }) => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="45%" height={44} />
      <Skeleton variant="text" width="25%" height={24} sx={{ mb: 3 }} />
      {range(lines).map((i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i % 3 === 2 ? "60%" : "100%"}
          sx={{ mb: 0.5 }}
        />
      ))}
    </CardContent>
  </Card>
);

export const SkeletonLoader = ({
  variant = "card",
  count = 6,
  minItemWidth = 320,
  itemsPerGroup = 6,
  lines = 2,
  showActions = true,
  gap = 3,
  sx = {},
}: SkeletonLoaderProps) => {
  if (variant === "grouped") {
    return (
      <Box
        role="status"
        aria-busy="true"
        aria-label="Loading"
        sx={{
          display: "grid",
          // Matches the section-card layout: one column, two from lg up.
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          alignItems: "start",
          gap,
          ...sx,
        }}
      >
        {range(count).map((i) => (
          <GroupSkeleton
            key={i}
            items={itemsPerGroup}
            minItemWidth={minItemWidth}
          />
        ))}
      </Box>
    );
  }

  if (variant === "detail") {
    return (
      <Box role="status" aria-busy="true" aria-label="Loading" sx={sx}>
        <DetailSkeleton lines={Math.max(lines, 4)} />
      </Box>
    );
  }

  if (variant === "list") {
    return (
      <Box
        role="status"
        aria-busy="true"
        aria-label="Loading"
        sx={{ display: "flex", flexDirection: "column", gap, ...sx }}
      >
        {range(count).map((i) => (
          <ListItemSkeleton key={i} lines={lines} showActions={showActions} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading"
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
        gap,
        ...sx,
      }}
    >
      {range(count).map((i) => (
        <CardSkeleton key={i} lines={lines} showActions={showActions} />
      ))}
    </Box>
  );
};
