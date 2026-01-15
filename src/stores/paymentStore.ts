import { create } from 'zustand';
import api, { type PaymentChannel, type PaymentChannelGroup } from '@/lib/api';

interface FeeCalculation {
  fee: number;
  total: number;
}

interface PaymentState {
  channels: PaymentChannel[];
  groupedChannels: PaymentChannelGroup[] | null;
  currentChannel: PaymentChannel | null;
  feeCalculation: FeeCalculation | null;
  isLoading: boolean;
  error: string | null;
  
  fetchChannels: () => Promise<void>;
  fetchChannelsByType: (type: string) => Promise<void>;
  fetchGroupedChannels: () => Promise<void>;
  fetchChannel: (code: string) => Promise<void>;
  calculateFee: (amount: number, channelCode: string) => Promise<FeeCalculation | null>;
  clearFeeCalculation: () => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  channels: [],
  groupedChannels: null,
  currentChannel: null,
  feeCalculation: null,
  isLoading: false,
  error: null,

  fetchChannels: async () => {
    set({ isLoading: true, error: null });
    const response = await api.getPaymentChannels();
    
    if (response.success && response.data) {
      set({ channels: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch payment channels', isLoading: false });
    }
  },

  fetchChannelsByType: async (type: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getPaymentChannelsByType(type);
    
    if (response.success && response.data) {
      set({ channels: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch payment channels', isLoading: false });
    }
  },

  fetchGroupedChannels: async () => {
    set({ isLoading: true, error: null });
    const response = await api.getGroupedPaymentChannels();
    
    if (response.success && response.data) {
      set({ groupedChannels: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch payment channels', isLoading: false });
    }
  },

  fetchChannel: async (code: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getPaymentChannel(code);
    
    if (response.success && response.data) {
      set({ currentChannel: response.data, isLoading: false });
    } else {
      set({ error: response.error || 'Failed to fetch payment channel', isLoading: false });
    }
  },

  calculateFee: async (amount: number, channelCode: string) => {
    const response = await api.calculateFee(amount, channelCode);
    
    if (response.success && response.data) {
      set({ feeCalculation: response.data });
      return response.data;
    }
    return null;
  },

  clearFeeCalculation: () => set({ feeCalculation: null }),
  clearError: () => set({ error: null }),
}));
