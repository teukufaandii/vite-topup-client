import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api, { type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      const result = await api.getProfile();
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        api.setToken(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (result.success && result.data) {
      api.setToken(result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await api.register(email, password, name);
    if (result.success && result.data) {
      api.setToken(result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
