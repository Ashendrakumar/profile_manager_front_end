/**
 * Theme Context
 * Manages theme state (light/dark mode) across the application
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { ThemeMode } from "@/theme";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme_mode";

/**
 * Get system preference for color scheme
 */
const getSystemPreference = (): ThemeMode => {
  if (typeof globalThis !== "undefined" && globalThis.matchMedia) {
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Provides theme state and toggle functionality
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get initial theme from localStorage, system preference, or default to 'light'
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedMode === "light" || savedMode === "dark") {
      return savedMode;
    }
    // If no saved preference, use system preference
    return getSystemPreference();
  });

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleTheme = () => {
    setModeState((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const value: ThemeContextType = { mode, toggleTheme, setMode };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
};
