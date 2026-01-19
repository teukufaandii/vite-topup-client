import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    phone: string,
    password: string,
    name: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const { toast } = useToast();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        const response = await api.login(email, password);

        if (response.success && response.data) {
          api.setToken(response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
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
          localStorage.setItem("refresh_token", response.data.refresh_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          toast({
            title: "Success",
            description: response.message,
            variant: "default",
          });
          return true;
        } else {
          set({
            error: response.error || "Registration failed",
            isLoading: false,
          });
          toast({
            title: "Failed",
            description: response.error,
            variant: "destructive",
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await api.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
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
        } else {
          set({ isLoading: false });
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

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
