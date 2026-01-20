import { create } from "zustand";
import api, {
  type Game,
  type Product,
  type Transaction,
  type PaymentChannel,
} from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingTransactions: number;
}

interface AdminState {
  stats: AdminStats | null;
  games: Game[];
  products: Product[];
  transactions: Transaction[];
  paymentChannels: PaymentChannel[];
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;

  fetchAllGames: () => Promise<void>;
  createGame: (data: FormData) => Promise<boolean>;
  updateGame: (id: string, data: FormData) => Promise<boolean>;
  deleteGame: (id: string) => Promise<boolean>;

  fetchAllProducts: (gameId?: string) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  fetchAllTransactions: () => Promise<void>;
  updateTransactionStatus: (id: string, status: string) => Promise<boolean>;

  fetchPaymentChannels: () => Promise<void>;
  updatePaymentChannel: (
    code: string,
    data: Partial<PaymentChannel>,
  ) => Promise<boolean>;

  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  games: [],
  products: [],
  transactions: [],
  paymentChannels: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true });
    const response = await api.getAdminStats();
    if (response.success && response.data) {
      set({ stats: response.data, isLoading: false });
    } else {
      set({ error: response.error, isLoading: false });
    }
  },

  fetchAllGames: async () => {
    set({ isLoading: true });
    const response = await api.getGames();
    if (response.success && response.data) {
      set({ games: response.data, isLoading: false });
    } else {
      set({ error: response.error, isLoading: false });
    }
  },

  createGame: async (data) => {
    set({ isLoading: true, error: null });
    const response = await api.createGame(data);
    if (response.success) {
      await get().fetchAllGames();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  updateGame: async (id, data) => {
    set({ isLoading: true, error: null });
    const response = await api.updateGame(id, data);
    if (response.success) {
      await get().fetchAllGames();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  deleteGame: async (id) => {
    set({ isLoading: true, error: null });
    const response = await api.deleteGame(id);
    if (response.success) {
      await get().fetchAllGames();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  fetchAllProducts: async (gameId) => {
    set({ isLoading: true });
    const response = gameId
      ? await api.getProductsByGame(gameId)
      : await api.getAllProducts();
    if (response.success && response.data) {
      set({ products: response.data, isLoading: false });
    } else {
      set({ error: response.error, isLoading: false });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    const response = await api.createProduct(data);
    if (response.success) {
      await get().fetchAllProducts();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    const response = await api.updateProduct(id, data);
    if (response.success) {
      await get().fetchAllProducts();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    const response = await api.deleteProduct(id);
    if (response.success) {
      await get().fetchAllProducts();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  fetchAllTransactions: async () => {
    set({ isLoading: true });
    const response = await api.getAllTransactions();
    if (response.success && response.data) {
      set({ transactions: response.data, isLoading: false });
    } else {
      set({ error: response.error, isLoading: false });
    }
  },

  updateTransactionStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    const response = await api.updateTransactionStatus(id, status);
    if (response.success) {
      await get().fetchAllTransactions();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  fetchPaymentChannels: async () => {
    set({ isLoading: true });
    const response = await api.getPaymentChannels();
    if (response.success && response.data) {
      set({ paymentChannels: response.data, isLoading: false });
    } else {
      set({ error: response.error, isLoading: false });
    }
  },

  updatePaymentChannel: async (code, data) => {
    set({ isLoading: true, error: null });
    const response = await api.updatePaymentChannel(code, data);
    if (response.success) {
      await get().fetchPaymentChannels();
      return true;
    }
    set({ error: response.error, isLoading: false });
    return false;
  },

  clearError: () => set({ error: null }),
}));