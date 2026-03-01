/**
 * AboutPage Component
 * About page of the application
 */

import { Typography, Card, CardContent, Container } from '@mui/material';
import { useMetadata } from '@/hooks';

/**
 * About page component
 */
const AboutPage = () => {
  // Set page metadata
  useMetadata({
    title: 'About Us - Profile Manager',
    description: 'Learn more about Profile Manager and our mission',
    keywords: 'about, information, company',
  });

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        About Profile Manager
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            Profile Manager is a production-ready React application built with modern best practices
            and enterprise-grade architecture. This project demonstrates how to structure a scalable
            React application using TypeScript, Vite, Material UI, and React Router.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Technology Stack
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li>React 18+ with TypeScript</li>
              <li>Vite for fast development and building</li>
              <li>Material UI (MUI) for beautiful components</li>
              <li>React Router with lazy loading</li>
              <li>Axios for API communication</li>
              <li>Centralized state management ready</li>
            </ul>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Architecture
          </Typography>
          <Typography variant="body1" paragraph>
            The application follows a module-based folder structure, making it easy to scale and
            maintain. Each module is self-contained with its own pages, services, and components.
            Common utilities, hooks, and components are shared across modules.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AboutPage;
