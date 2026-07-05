/**
 * MainLayout Component
 * Main application layout with navigation
 */

import type { ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/contexts";
import { Header } from "./Header";
import { Body } from "./Body";
import { LoadingSpinner } from "@/common/components";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import { AuthLayout } from "./AuthLayout";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component
 * Provides consistent layout structure across the application
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDE_BAR);
    return stored ? JSON.parse(stored) : true;
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDE_BAR, JSON.stringify(open));
  }, [open]);

  // Check if current route is login or register
  const isAuthPage =
    location.pathname === ROUTES.LOGIN ||
    location.pathname === ROUTES.REGISTER ||
    location.pathname === ROUTES.VERIFY_OTP;

  useEffect(() => {
    const storedOpen = localStorage.getItem(STORAGE_KEYS.SIDE_BAR);
    if (storedOpen) {
      setOpen(JSON.parse(storedOpen));
    } else {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const isOpen = !!open;
    localStorage.setItem(STORAGE_KEYS.SIDE_BAR, isOpen.toString());
  }, [open]);

  const isCollapsed = useMemo(() => !isMobile && !open, [isMobile, open]);

  if (!isAuthenticated && isInitializing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Render Header and Body components */}
      {isAuthenticated && !isAuthPage ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Header setOpen={setOpen} />
          <Sidebar
            open={open}
            setOpen={setOpen}
            isMobile={isMobile}
            isCollapsed={isCollapsed}
          />
          <Body open={open} isCollapsed={isCollapsed}>
            {children}
          </Body>
        </Box>
      ) : (
        <AuthLayout>{children}</AuthLayout>
      )}
    </Box>
  );
};
