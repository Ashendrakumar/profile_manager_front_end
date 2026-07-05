/**
 * SkeletonLoader Component
 * Generic, reusable skeleton placeholder for listing/detail pages.
 * Renders a responsive grid of card skeletons, a stacked list, or a
 * single detail block while data is loading.
 */

import { Box, Card, CardContent, CardActions, Skeleton } from "@mui/material";

export type SkeletonLoaderProps = {
  /** Visual shape of each placeholder. Defaults to `card`. */
  variant?: "card" | "list" | "detail";
  /** Number of placeholder items to render (ignored for `detail`). */
  count?: number;
  /** Min width (px) of each card in the responsive grid (`card` variant). */
  minItemWidth?: number;
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
  lines = 2,
  showActions = true,
  gap = 3,
  sx = {},
}: SkeletonLoaderProps) => {
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
