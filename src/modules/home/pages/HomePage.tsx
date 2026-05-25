/**
 * HomePage Component
 * Home page of the application with graphs and filters
 */

import { useState } from "react";
import { Box, Card, CardContent, Grid, Typography, Paper } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMetadata } from "@/hooks";

/**
 * Generate dummy data for charts
 */
const generateLineChartData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month) => ({
    name: month,
    value: Math.floor(Math.random() * 1000) + 200,
    sales: Math.floor(Math.random() * 800) + 150,
  }));
};

const generateBarChartData = () => {
  const categories = [
    "Category A",
    "Category B",
    "Category C",
    "Category D",
    "Category E",
  ];
  return categories.map((category) => ({
    name: category,
    value: Math.floor(Math.random() * 500) + 100,
    target: Math.floor(Math.random() * 400) + 150,
  }));
};

const generateAreaChartData = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return days.map((day) => ({
    name: `Day ${day}`,
    value: Math.floor(Math.random() * 300) + 50,
    growth: Math.floor(Math.random() * 200) + 30,
  }));
};

/**
 * Home page component
 */
const HomePage = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs().subtract(30, "day"),
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  // Set page metadata
  useMetadata({
    title: "Home - Profile Manager",
    description: "Dashboard with graphs and analytics",
    keywords: "dashboard, graphs, analytics",
  });

  const lineChartData = generateLineChartData();
  const barChartData = generateBarChartData();
  const areaChartData = generateAreaChartData();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Filter Row */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* <Typography variant="h6" sx={{ minWidth: 'fit-content' }}>
            Filters:
          </Typography> */}
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
            minDate={startDate || undefined}
          />
        </Paper>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Line Chart */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                    <Bar dataKey="target" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Area Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Growth Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={areaChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="growth"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default HomePage;
