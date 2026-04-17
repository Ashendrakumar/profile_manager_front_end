/**
 * Authentication Context
 * Manages authentication state across the application
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  authService,
  type User,
  type LoginRequest,
  type RegisterRequest,
} from "@/modules/auth/services/authService";
import { ROUTES } from "@/constants";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Provides authentication state and methods
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = authService.getUser();
        const isAuth = authService.isAuthenticated();

        if (isAuth && storedUser) {
          setUser(storedUser);
        } else {
          // Clear invalid auth data
          authService.clearAuth();
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.login(credentials);
        setUser(response.user);

        // Redirect to home or previous location
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  /**
   * Register function
   */
  const register = useCallback(
    async (userData: RegisterRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.register(userData);
        debugger;
        if (response) setUser(response.user);

        // Redirect to home after registration
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);

      // Redirect to login
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Clear local state even if API call fails
      setUser(null);
      authService.clearAuth();
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Update user function
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser((preVious) => ({ ...preVious, ...updatedUser }));
  }, []);

  /**
   * Clear error function
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    updateUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
