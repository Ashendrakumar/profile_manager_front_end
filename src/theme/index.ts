/**
 * Material UI Theme Configuration
 * Centralized theme setup with customization options
 */

import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// Custom theme options interface
interface CustomThemeOptions extends ThemeOptions {
  // Add custom theme properties here if needed
}

// Teal color palette
const tealColors = {
  main: "#00897b", // Teal 600
  light: "#4fb3bf", // Teal 400
  dark: "#00695c", // Teal 800
  contrastText: "#ffffff",
  50: "#E0F2F1",
  100: "#B2DFDB",
  200: "#80CBC4",
  300: "#4DB6AC",
  400: "#26A69A",
  500: "#009688",
  600: "#00897B",
  700: "#00796B",
  800: "#9FE1CB",
  900: "#004D40",
};

// Light theme configuration with teal primary color
const lightThemeOptions: CustomThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      light: tealColors[400],
      main: tealColors[600],
      dark: tealColors[800],
      contrastText: tealColors.contrastText,
      50: tealColors[50],
      100: tealColors[100],
      200: tealColors[200],
      300: tealColors[300],
      400: tealColors[400],
      500: tealColors[500],
      600: tealColors[600],
      700: tealColors[700],
      800: tealColors[800],
      900: tealColors[900],
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ed6c02",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#2e7d32",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: "large", // ✅ default size
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: "0.8rem",
          fontWeight: 500,
          height: "28px",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: "0.9rem",
          fontWeight: 500,
          minHeight: "48px",
          textTransform: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.9rem",
          padding: "12px 16px",
        },
        head: {
          fontWeight: 600,
          fontSize: "0.85rem",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
          "@media (min-width: 600px)": {
            paddingLeft: "32px",
            paddingRight: "32px",
          },
          "@media (min-width: 1200px)": {
            maxWidth: "1400px",
          },
        },
      },
    },
  },
};

// Dark theme configuration with teal primary color
const darkThemeOptions: CustomThemeOptions = {
  ...lightThemeOptions,
  palette: {
    ...lightThemeOptions.palette,
    mode: "dark",
    primary: {
      light: tealColors[300],
      main: tealColors[400],
      dark: tealColors[600],
      contrastText: tealColors.contrastText,
      50: tealColors[900],
      100: tealColors[800],
      200: tealColors[700],
      300: tealColors[600],
      400: tealColors[400],
      500: tealColors[500],
      600: tealColors[200],
      700: tealColors[100],
      800: tealColors[50],
      900: tealColors[50],
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  components: {
    ...lightThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
};

// Create themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export default theme (light)
export const theme = lightTheme;

// Theme type for TypeScript
export type ThemeMode = "light" | "dark";
