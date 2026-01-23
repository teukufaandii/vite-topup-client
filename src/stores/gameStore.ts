import { create } from "zustand";
import api, { type Categories, type Game } from "@/lib/api";

interface GameState {
  games: Game[];
  categories: Categories[];
  popularGames: Game[];
  currentGame: Game | null;
  isLoading: boolean;
  error: string | null;

  fetchGames: () => Promise<void>;
  fetchPopularGames: () => Promise<void>;
  fetchGamesByCategory: (category: string) => Promise<void>;
  fetchGameByCode: (code: string) => Promise<void>;
  getCategories: () => Promise<void>;
  clearCurrentGame: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  popularGames: [],
  categories: [],
  currentGame: null,
  isLoading: false,
  error: null,

  fetchGames: async () => {
    set({ isLoading: true, error: null });
    const response = await api.getGames();

    if (response.success && response.data) {
      set({ games: response.data, isLoading: false });
    } else {
      set({
        error: response.error || "Failed to fetch games",
        isLoading: false,
      });
    }
  },

  fetchPopularGames: async () => {
    set({ isLoading: true, error: null });
    const response = await api.getPopularGames();

    if (response.success && response.data) {
      set({ popularGames: response.data, isLoading: false });
    } else {
      set({
        error: response.error || "Failed to fetch popular games",
        isLoading: false,
      });
    }
  },

  fetchGamesByCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getGamesByCategory(category);

    if (response.success && response.data) {
      set({ games: response.data, isLoading: false });
    } else {
      set({
        error: response.error || "Failed to fetch games",
        isLoading: false,
      });
    }
  },

  fetchGameByCode: async (code: string) => {
    set({ isLoading: true, error: null });
    const response = await api.getGameByCode(code);

    if (response.success && response.data) {
      set({ currentGame: response.data, isLoading: false });
    } else {
      set({
        error: response.error || "Failed to fetch game",
        isLoading: false,
      });
    }
  },

  getCategories: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    const response = await api.getCategories();

    if (response.success && response.data) {
      set({ categories: response.data, isLoading: false });
    } else {
      set({
        error: response.error || "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  clearCurrentGame: () => set({ currentGame: null }),
  clearError: () => set({ error: null }),
}));
