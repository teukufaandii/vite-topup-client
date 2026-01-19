const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  meta?: PaginationMeta; 
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("access_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  getToken() {
    return this.token || localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: "Failed to parse response" };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
        }

        return {
          success: false,
          error: data.message || data.error || response.statusText,
          code: data.code || "UNKNOWN_ERROR",
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        code: "NETWORK_ERROR",
      };
    }
  }

  async register(email: string, phone: string, password: string, name: string) {
    const response = await this.request<{
      user: User;
      access_token: string;
      refresh_token: string;
      phone: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, phone, password, full_name: name }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      user: User;
      access_token: string;
      refresh_token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async logout() {
    const result = await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
    localStorage.removeItem("refresh_token");
    return result;
  }

  async getProfile() {
    return this.request<User>("/auth/profile");
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getGames() {
    return this.request<Game[]>("/games");
  }

  async getPopularGames() {
    return this.request<Game[]>("/games/popular");
  }

  async getGamesByCategory(category: string) {
    return this.request<Game[]>(`/games/category/${category}`);
  }

  async getGameByCode(code: string) {
    return this.request<Game>(`/games/${code}`);
  }

  async getProductsByGame(gameId: string) {
    return this.request<Product[]>(`/products/game/${gameId}`);
  }

  async getActiveProductsByGame(gameId: string) {
    return this.request<Product[]>(`/products/game/${gameId}/active`);
  }

  async getProductBySku(sku: string) {
    return this.request<Product>(`/products/sku/${sku}`);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async getTransactions() {
    return this.request<Transaction[]>("/transactions");
  }

  async getTransaction(id: string) {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  async getTransactionStatus(id: string) {
    return this.request<{ status: string }>(`/transactions/${id}/status`);
  }

  async createTransaction(data: CreateTransactionRequest) {
    return this.request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPaymentChannels() {
    return this.request<PaymentChannel[]>("/payment/channels");
  }

  async getPaymentChannelsByType(type: string) {
    return this.request<PaymentChannel[]>(
      `/payment/channels/type?type=${type}`,
    );
  }

  async getGroupedPaymentChannels() {
    return this.request<PaymentChannelGroup[]>("/payment/channels/grouped");
  }

  async getPaymentChannel(code: string) {
    return this.request<PaymentChannel>(`/payment/channels/${code}`);
  }

  async calculateFee(amount: number, code: string) {
    return this.request<{ fee_amount: number; total: number }>(
      "/payment/calculate-fee",
      {
        method: "POST",
        body: JSON.stringify({ amount, code }),
      },
    );
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  banner?: string;
  category: string;
  total_sold: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  input_fields?: GameInputField[];
  created_at: string;
  updated_at: string;
}

export interface InputFieldOption {
  value: string;
  label: string;
}

export interface GameInputField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: InputFieldOption[];
}

export interface Product {
  id: string;
  game_id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  denomination: number;
  denomination_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  game_name: string;
  product_name: string;
  target_user_id: string;
  amount: number;
  admin_fee: number;
  total_amount: number;
  status: "pending" | "processing" | "success" | "failed" | "expired";
  payment_method: string; 
  payment_url?: string;
  expired_at?: string;
  created_at: string;
  
  game?: Game; 
  product?: Product;
}

export interface PaymentChannel {
  id: string;
  code: string;
  name: string;
  type: string;
  provider: string;
  icon?: string;
  fee_flat: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
  is_active?: boolean;
}

export interface PaymentChannelGroup {
  provider: string;
  type: string;
  channels: PaymentChannel[];
}

export interface CreateTransactionRequest {
  product_item_id: string;
  channel_code: string;
  player_id: string;
  player_data?: Record<string, string>;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export const api = new ApiClient(API_BASE_URL);
export default api;
