import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

// Token refresh interval (14 minutes - assuming 15 min token expiry)
const REFRESH_INTERVAL = 14 * 60 * 1000;
// Check token expiry every minute
const CHECK_INTERVAL = 60 * 1000;

export const useTokenRefresh = () => {
  const { isAuthenticated, refreshToken, logout } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial token refresh attempt on mount if authenticated
    const token = api.getToken();
    if (token) {
      const tokenData = parseJwt(token);
      if (tokenData && isTokenExpiringSoon(tokenData.exp)) {
        refreshToken();
        lastRefreshRef.current = Date.now();
      }
    }

    // Set up periodic token check and refresh
    intervalRef.current = setInterval(async () => {
      const currentToken = api.getToken();
      if (!currentToken) {
        logout();
        return;
      }

      const tokenData = parseJwt(currentToken);
      if (!tokenData) {
        logout();
        return;
      }

      // Check if token is expired
      if (isTokenExpired(tokenData.exp)) {
        // Try to refresh, if fails logout
        const success = await refreshToken();
        if (!success) {
          logout();
        }
        return;
      }

      // Check if we should refresh proactively
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (
        timeSinceLastRefresh >= REFRESH_INTERVAL ||
        isTokenExpiringSoon(tokenData.exp)
      ) {
        const success = await refreshToken();
        if (success) {
          lastRefreshRef.current = Date.now();
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, refreshToken, logout]);
};

// Parse JWT token without library
function parseJwt(token: string): { exp: number; iat: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token will expire in next 5 minutes
function isTokenExpiringSoon(exp: number): boolean {
  const expiryTime = exp * 1000; // Convert to milliseconds
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() + bufferTime >= expiryTime;
}

// Check if token is already expired
function isTokenExpired(exp: number): boolean {
  const expiryTime = exp * 1000;
  return Date.now() >= expiryTime;
}

export default useTokenRefresh;
