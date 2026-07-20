/**
 * Toast Context
 * Provides global toast notification functionality
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

/**
 * Toast message interface
 */
export interface ToastMessage {
  message: string;
  severity?: AlertColor;
  duration?: number;
}

/**
 * Toast context type
 */
interface ToastContextType {
  showToast: (
    message: string,
    severity?: AlertColor,
    duration?: number,
  ) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Global toast service (can be used outside React components)
 */
class ToastService {
  private listeners: Array<(toast: ToastMessage) => void> = [];

  subscribe(listener: (toast: ToastMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(toast: ToastMessage) {
    this.listeners.forEach((listener) => listener(toast));
  }

  show(message: string, severity: AlertColor = "info", duration = 6000) {
    this.notify({ message, severity, duration });
  }

  error(message: string, duration = 6000) {
    this.show(message, "error", duration);
  }

  success(message: string, duration = 4000) {
    this.show(message, "success", duration);
  }

  warning(message: string, duration = 5000) {
    this.show(message, "warning", duration);
  }

  info(message: string, duration = 4000) {
    this.show(message, "info", duration);
  }
}

// Export global toast service instance
export const toastService = new ToastService();

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider Component
 * Provides toast notification functionality
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);

  // Subscribe to global toast service
  useState(() => {
    const unsubscribe = toastService.subscribe((newToast) => {
      setToast(newToast);
      setOpen(true);
    });
    return unsubscribe;
  });

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const showToast = useCallback(
    (message: string, severity: AlertColor = "info", duration = 6000) => {
      setToast({ message, severity, duration });
      setOpen(true);
    },
    [],
  );

  const showError = useCallback(
    (message: string, duration = 6000) => {
      showToast(message, "error", duration);
    },
    [showToast],
  );

  const showSuccess = useCallback(
    (message: string, duration = 4000) => {
      showToast(message, "success", duration);
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, duration = 5000) => {
      showToast(message, "warning", duration);
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, duration = 4000) => {
      showToast(message, "info", duration);
    },
    [showToast],
  );

  const value: ToastContextType = {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={toast?.duration || 6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast?.severity || "info"}
          variant="filled"
          sx={{ width: "100%", maxWidth: "400px" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast context
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
