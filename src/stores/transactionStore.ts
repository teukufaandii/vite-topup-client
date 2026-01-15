import { create } from 'zustand';
import api, { type Transaction, type CreateTransactionRequest } from '@/lib/api';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: () => Promise<void>;
  fetchTransaction: (id: string) => Promise<void>;
  fetchTransactionStatus: (id: string) => Promise<string | null>;
  createTransaction: (data: CreateTransactionRequest) => Promise<Transaction | null>;
  clearCurrentTransaction: () => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    const response = await api.getTransactions();
    
    if (response.success && response.data) {
      set({ transactions: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch transactions', isLoading: false });
    }
  },

  fetchTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getTransaction(id);
    
    if (response.success && response.data) {
      set({ currentTransaction: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch transaction', isLoading: false });
    }
  },

  fetchTransactionStatus: async (id: string) => {
    const response = await api.getTransactionStatus(id);
    
    if (response.success && response.data) {
      return response.data.status;
    }
    return null;
  },

  createTransaction: async (data: CreateTransactionRequest) => {
    set({ isLoading: true, error: null });
    const response = await api.createTransaction(data);
    
    if (response.success && response.data) {
      set((state) => ({ 
        transactions: [response.data!, ...state.transactions],
        currentTransaction: response.data,
        isLoading: false 
      }));
      return response.data;
    } else {
      set({ error: response.error || 'Failed to create transaction', isLoading: false });
      return null;
    }
  },

  clearCurrentTransaction: () => set({ currentTransaction: null }),
  clearError: () => set({ error: null }),
}));
