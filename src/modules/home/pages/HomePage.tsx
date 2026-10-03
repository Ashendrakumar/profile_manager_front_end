/**
 * HomePage — Admin Dashboard
 *
 * Real metrics assembled from the users API: the list endpoint gives totals and
 * roles; each user's detail (fetched in parallel) adds completion %, verified
 * state and join date. From that we derive KPIs, a signups trend, a completion
 * distribution and a recent-members list — all rendered with Recharts and the
 * app's design-system tokens (teal brand, theme-aware, light/dark).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  People,
  DonutLarge,
  VerifiedUser,
  EmojiEvents,
  Refresh,
  ErrorOutline,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { useMetadata } from "@/hooks";
import { useToast } from "@/contexts";
import { userService } from "@/modules/users/services/userService";
import { HelperFunctions } from "@/utils/helpers";
import { StatCard } from "../components/StatCard";
import { ResponsiveButton } from "@/common/components";

// ── Types ────────────────────────────────────────────────────────────────────
interface EnrichedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  completion: number | null;
  createdAt?: string;
  verified: boolean;
}

interface DashboardData {
  totalUsers: number;
  admins: number;
  members: number;
  verified: number;
  avgCompletion: number;
  fullyCompleted: number;
  signupsByMonth: { name: string; signups: number }[];
  completionBuckets: { name: string; users: number }[];
  roleSplit: { name: string; value: number }[];
  recentMembers: EnrichedUser[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const COMPLETION_BUCKETS = [
  { name: "0–25%", min: 0, max: 25 },
  { name: "26–50%", min: 26, max: 50 },
  { name: "51–75%", min: 51, max: 75 },
  { name: "76–99%", min: 76, max: 99 },
  { name: "100%", min: 100, max: 100 },
];

const buildDashboard = (
  totalUsers: number,
  enriched: EnrichedUser[],
): DashboardData => {
  const admins = enriched.filter((u) => u.role === "admin").length;
  const verified = enriched.filter((u) => u.verified).length;
  const withCompletion = enriched.filter((u) => u.completion != null);
  const avgCompletion = withCompletion.length
    ? Math.round(
        withCompletion.reduce((sum, u) => sum + (u.completion ?? 0), 0) /
          withCompletion.length,
      )
    : 0;
  const fullyCompleted = enriched.filter((u) => u.completion === 100).length;

  // Signups per month over the last 6 months (from real createdAt).
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = dayjs().subtract(5 - i, "month");
    return { key: m.format("YYYY-MM"), name: m.format("MMM"), signups: 0 };
  });
  enriched.forEach((u) => {
    if (!u.createdAt) return;
    const key = dayjs(u.createdAt).format("YYYY-MM");
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.signups += 1;
  });

  const completionBuckets = COMPLETION_BUCKETS.map((b) => ({
    name: b.name,
    users: withCompletion.filter(
      (u) => (u.completion ?? 0) >= b.min && (u.completion ?? 0) <= b.max,
    ).length,
  }));

  const recentMembers = [...enriched]
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    .slice(0, 5);

  return {
    totalUsers,
    admins,
    members: enriched.length - admins,
    verified,
    avgCompletion,
    fullyCompleted,
    signupsByMonth: months.map(({ name, signups }) => ({ name, signups })),
    completionBuckets,
    roleSplit: [
      { name: "Members", value: enriched.length - admins },
      { name: "Admins", value: admins },
    ],
    recentMembers,
  };
};

const completionChipColor = (
  pct: number,
): "success" | "primary" | "warning" | "error" => {
  if (pct >= 100) return "success";
  if (pct >= 60) return "primary";
  if (pct >= 30) return "warning";
  return "error";
};

// ── Component ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const theme = useTheme();
  const { showError } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useMetadata({
    title: "Dashboard - Profile Manager",
    description: "Admin dashboard with members, completion and activity",
    keywords: "dashboard, analytics, users, completion",
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await userService.getAllUsers();

      // Enrich each user with completion / verified / join date (detail endpoint).
      const settled = await Promise.allSettled(
        users.map(async (u): Promise<EnrichedUser> => {
          const id = u._id ?? u.id ?? "";
          const d = await userService.getUserById(id);
          return {
            id,
            name: d.username || u.username || u.email,
            email: d.email,
            role: d.role,
            completion: d.profileCompletion?.percentage ?? null,
            createdAt: d.createdAt,
            verified: Boolean(d.isVerified),
          };
        }),
      );

      const enriched = settled
        .filter(
          (s): s is PromiseFulfilledResult<EnrichedUser> =>
            s.status === "fulfilled",
        )
        .map((s) => s.value);

      setData(buildDashboard(users.length, enriched));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Theme-aware chart tokens ───────────────────────────────────────────────
  const primary = theme.palette.primary.main;
  const gridStroke = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;
  const bucketColors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.success.main,
  ];
  const roleColors = [theme.palette.primary.main, theme.palette.secondary.main];

  const tooltipProps = useMemo(
    () => ({
      cursor: { fill: alpha(primary, 0.06) },
      contentStyle: {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        boxShadow: theme.shadows[3],
        fontSize: 12,
      },
      labelStyle: { color: theme.palette.text.primary, fontWeight: 600 },
      itemStyle: { color: theme.palette.text.secondary },
    }),
    [theme, primary],
  );

  const pageHeader = (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of members, completion and activity
        </Typography>
      </Box>
      <ResponsiveButton icon={<Refresh />} onClick={fetchDashboard} disabled={loading}>
        Refresh
      </ResponsiveButton>
    </Box>
  );

  if (error && !data) {
    return (
      <>
        {pageHeader}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 8,
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: "error.main" }} />
          <Typography variant="h6">Couldn't load the dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          <ResponsiveButton icon={<Refresh />} onClick={fetchDashboard}>
            Try Again
          </ResponsiveButton>
        </Box>
      </>
    );
  }

  const chartTitle = (title: string) => (
    <Typography variant="h6" sx={{ fontSize: "1rem", mb: 1.5 }}>
      {title}
    </Typography>
  );

  return (
    <>
      {pageHeader}

      {/* KPI row */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<People />}
            label="Total users"
            value={data?.totalUsers ?? 0}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<DonutLarge />}
            label="Avg. completion"
            value={`${data?.avgCompletion ?? 0}%`}
            color={theme.palette.secondary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<EmojiEvents />}
            label="Fully completed"
            value={data?.fullyCompleted ?? 0}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<VerifiedUser />}
            label="Verified users"
            value={data?.verified ?? 0}
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              {chartTitle("New signups · last 6 months")}
              {loading ? (
                <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={data?.signupsByMonth}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={{ stroke: gridStroke }}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      fontSize={12}
                    />
                    <Tooltip {...tooltipProps} />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      name="Signups"
                      stroke={primary}
                      strokeWidth={2.5}
                      fill="url(#signupFill)"
                      dot={{ r: 3, fill: primary }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              {chartTitle("Members vs admins")}
              {loading ? (
                <Skeleton variant="rounded" width="100%" height={266} sx={{ borderRadius: 2 }} />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={data?.roleSplit}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {data?.roleSplit.map((_, i) => (
                          <Cell key={i} fill={roleColors[i % roleColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipProps} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 1 }}>
                    {data?.roleSplit.map((s, i) => (
                      <Stack key={s.name} direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: roleColors[i % roleColors.length],
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {s.name} · <b>{s.value}</b>
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              {chartTitle("Profile completion distribution")}
              {loading ? (
                <Skeleton variant="rounded" width="100%" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={data?.completionBuckets}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={{ stroke: gridStroke }}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      fontSize={12}
                    />
                    <Tooltip {...tooltipProps} />
                    <Bar dataKey="users" name="Users" radius={[8, 8, 0, 0]} maxBarSize={64}>
                      {data?.completionBuckets.map((_, i) => (
                        <Cell key={i} fill={bucketColors[i % bucketColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              {chartTitle("Recent members")}
              {loading ? (
                <Stack spacing={2}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="55%" />
                        <Skeleton variant="text" width="35%" />
                      </Box>
                      <Skeleton variant="rounded" width={44} height={24} />
                    </Stack>
                  ))}
                </Stack>
              ) : data && data.recentMembers.length > 0 ? (
                <Stack divider={<Divider flexItem />} spacing={0}>
                  {data.recentMembers.map((m) => (
                    <Stack
                      key={m.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ py: 1.25 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: alpha(primary, 0.14),
                          color: primary,
                        }}
                      >
                        {HelperFunctions.getInitials(m.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {m.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {m.createdAt
                            ? `Joined ${dayjs(m.createdAt).format("MMM D, YYYY")}`
                            : m.email}
                        </Typography>
                      </Box>
                      {m.completion != null && (
                        <Chip
                          size="small"
                          label={`${m.completion}%`}
                          color={completionChipColor(m.completion)}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No members yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
