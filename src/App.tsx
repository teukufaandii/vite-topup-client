import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import AdminDashboard from "./pages/admin/Dashboard";
import GamesManagement from "./pages/admin/GamesManagement";
import { useAuthStore } from "./stores";
import { useEffect } from "react";
import useTokenRefresh from "./hooks/useTokenRefresh";
import useNotifications from "./hooks/useNotification";
import TransactionsManagement from "./pages/admin/TransactionManagement";
import ProductsManagement from "./pages/admin/ProductManagement";

const queryClient = new QueryClient();

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Enable automatic token refresh
  useTokenRefresh();

  useNotifications();

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:code" element={<GameDetail />} />

            {/* Protected User Routes */}
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/games" element={<GamesManagement />} />
            <Route
              path="/admin/transactions"
              element={<TransactionsManagement />}
            />
            <Route path="/admin/products" element={<ProductsManagement />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
