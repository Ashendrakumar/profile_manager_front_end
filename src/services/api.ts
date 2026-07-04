/**
 * Axios API Service
 * Centralized API configuration with interceptors
 */

import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, STORAGE_KEYS, HTTP_STATUS, ROUTES } from "@/constants";
import { toastService } from "@/contexts";

/**
 * Custom error interface for API errors
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Attaches authentication token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // Attach token to request headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        config,
      );
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles global error responses (401, 403, 500, etc.)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response,
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle response error
    const status = error.response?.status;
    let errorMessage =
      (error.response?.data as { message?: string })?.message || error.message;
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Handle 401 Unauthorized - Token expired or invalid
        console.error("[API Error] Unauthorized - Token may be expired");

        // Show toast notification
        // toastService.error('Session expired. Please login again.');

        // Clear stored tokens
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Redirect to login page
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = ROUTES.LOGIN;
        }
        break;

      case HTTP_STATUS.FORBIDDEN:
        // Handle 403 Forbidden
        console.error("[API Error] Forbidden - Insufficient permissions");
        toastService.error(
          "You do not have permission to perform this action.",
        );
        break;

      case HTTP_STATUS.NOT_FOUND:
        // Handle 404 Not Found
        console.error("[API Error] Resource not found");
        toastService.warning("The requested resource was not found.");
        break;

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        // Handle 500 Internal Server Error
        console.error("[API Error] Internal server error");
        toastService.error(
          errorMessage || "Server error. Please try again later.",
        );
        break;

      case HTTP_STATUS.BAD_REQUEST:
        toastService.error(
          errorMessage || "Invalid request. Please check your input.",
        );
        break;

      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        toastService.error(
          errorMessage || "Validation error. Please check your input.",
        );
        break;

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        toastService.warning("Too many requests. Please try again later.");
        break;

      default:
        if (!error.response) {
          // Network error (no response from server)
          toastService.error("Network error. Please check your connection.");
        } else {
          // Other HTTP errors
          toastService.error(
            errorMessage || "An error occurred. Please try again.",
          );
        }
        console.error("[API Error]", errorMessage);
    }
    // Create standardized error object
    const apiError: ApiError = {
      message: errorMessage,
      status,
      data: error?.response?.data,
    };

    return Promise.reject(apiError);
  },
);

/**
 * API Service Methods
 * Provides typed methods for HTTP operations
 */
const inFlight = new Map<string, Promise<any>>(); /// Map to track in-flight GET requests
export const apiService = {
  /**
   * GET request
   */

  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    // Key on URL + query params so requests to the same path with different
    // params are NOT collapsed into one shared (wrong) response.
    const key = `${url}?${JSON.stringify(config?.params ?? {})}`;

    if (inFlight.has(key)) {
      return inFlight.get(key)!;
    }

    const request = apiClient
      .get<T>(url, config)
      .then((res) => res.data)
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, request);

    return request;
  },

  /**
   * POST request
   */
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiClient
      .post<T>(url, data, config)
      .then((response) => response.data);
  },

  /**
   * PUT request
   */
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiClient
      .put<T>(url, data, config)
      .then((response) => response.data);
  },

  /**
   * PATCH request
   */
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiClient
      .patch<T>(url, data, config)
      .then((response) => response.data);
  },

  /**
   * DELETE request
   */
  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiClient.delete<T>(url, config).then((response) => response.data);
  },
};

// Export the axios instance for custom use cases
export default apiClient;
