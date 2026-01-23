import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { type User, type UserRole } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

interface AuthState {
  user: User | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastTokenRefresh: number | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    phone: string,
    password: string,
    name: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastTokenRefresh: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        const response = await api.login(email, password);

        if (response.success && response.data) {
          api.setToken(response.data.access_token);
          api.setRefreshToken(response.data.refresh_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            lastTokenRefresh: Date.now(),
          });
          await get().fetchRoles();
          return true;
        } else {
          set({ error: response.error || "Login failed", isLoading: false });
          return false;
        }
      },

      register: async (
        email: string,
        phone: string,
        password: string,
        name: string,
      ) => {
        set({ isLoading: true, error: null });
        const response = await api.register(email, phone, password, name);

        if (response.success && response.data) {
          api.setToken(response.data.access_token);
          api.setRefreshToken(response.data.refresh_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            lastTokenRefresh: Date.now(),
          });
          return true;
        } else {
          set({
            error: response.error || "Registration failed",
            isLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await api.logout();
        set({
          user: null,
          roles: [],
          isAuthenticated: false,
          isLoading: false,
          error: null,
          lastTokenRefresh: null,
        });
        toast({
          title: "Logout successful",
          description: "You have been logged out",
          variant: "default",
        });
      },

      fetchProfile: async () => {
        const token = api.getToken();
        if (!token) return;

        set({ isLoading: true });
        const response = await api.getProfile();

        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          await get().fetchRoles();
        } else {
          set({ isLoading: false });
        }
      },

      fetchRoles: async () => {
        const token = api.getToken();
        if (!token) return;

        const response = await api.getUserRoles();
        if (response.success && response.data) {
          set({ roles: [response.data] });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        const response = await api.updateProfile(data);

        if (response.success && response.data) {
          set({ user: response.data, isLoading: false });
          return true;
        } else {
          set({ error: response.error || "Update failed", isLoading: false });
          return false;
        }
      },

      refreshToken: async () => {
        const refreshSuccess = await api.refreshAccessToken();
        if (refreshSuccess) {
          set({ lastTokenRefresh: Date.now() });
          return true;
        } else {
          await get().logout();
          return false;
        }
      },

      hasRole: (role: string) => {
        const { roles } = get();
        return roles.some((r) => r.code === role);
      },

      isAdmin: () => {
        return get().hasRole("admin");
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const handleLogout = () => {
          get().logout();
        };

        window.addEventListener("auth:logout", handleLogout);

        const token = api.getToken();
        const refreshToken = api.getRefreshToken();

        if (token && refreshToken) {
          get().fetchProfile();
        } else if (get().isAuthenticated) {
          set({
            user: null,
            roles: [],
            isAuthenticated: false,
            lastTokenRefresh: null,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
        lastTokenRefresh: state.lastTokenRefresh,
      }),
    },
  ),
);
