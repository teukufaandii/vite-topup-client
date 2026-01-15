import { create } from 'zustand';
import api, { type Product } from '@/lib/api';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProductsByGame: (gameId: string) => Promise<void>;
  fetchActiveProductsByGame: (gameId: string) => Promise<void>;
  fetchProductBySku: (sku: string) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  clearProducts: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  fetchProductsByGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getProductsByGame(gameId);
    
    if (response.success && response.data) {
      set({ products: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchActiveProductsByGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getProductsByGame(gameId);
    
    if (response.success && response.data) {
      set({ products: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchProductBySku: async (sku: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getProductBySku(sku);
    
    if (response.success && response.data) {
      set({ currentProduct: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch product', isLoading: false });
    }
  },

  fetchProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getProduct(id);
    
    if (response.success && response.data) {
      set({ currentProduct: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch product', isLoading: false });
    }
  },

  clearProducts: () => set({ products: [], currentProduct: null }),
  clearError: () => set({ error: null }),
}));
