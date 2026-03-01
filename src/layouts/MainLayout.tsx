/**
 * MainLayout Component
 * Main application layout with navigation
 */

import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts';
import { Header } from './Header';
import { Body } from './Body';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component
 * Provides consistent layout structure across the application
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Check if current route is login or register
  const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header isAuthPage={isAuthPage} />
      <Body isAuthPage={isAuthPage}>{children}</Body>
      <Footer show={isAuthenticated && !isAuthPage} />
    </Box>
  );
};