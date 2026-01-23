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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("access_token");
  }

  bindUnauthorizedCallback(callback: () => void) {
    this.onUnauthorizedCallback = callback;
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

  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  }

  setRefreshToken(token: string | null) {
    if (token) {
      localStorage.setItem("refresh_token", token);
    } else {
      localStorage.removeItem("refresh_token");
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          resolve(!!token);
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const jsonResponse = await response.json();

      const payload = jsonResponse.data || jsonResponse;

      if (response.ok && payload.access_token) {
        this.setToken(payload.access_token);
        if (payload.refresh_token) {
          this.setRefreshToken(payload.refresh_token);
        }
        onTokenRefreshed(payload.access_token);
        isRefreshing = false;
        return true;
      } else {
        this.setToken(null);
        this.setRefreshToken(null);
        isRefreshing = false;
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.setToken(null);
      this.setRefreshToken(null);
      isRefreshing = false;
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (
        response.status === 401 &&
        retry &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/login")
      ) {
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.request<T>(endpoint, options, false);
        } else {
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return {
            success: false,
            error: "Session expired. Please login again.",
          };
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: "Failed to parse response" };
      }

      if (!response.ok) {
        if (response.status === 401) {
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          } else {
            this.setToken(null);
            this.setRefreshToken(null);
          }
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
        meta: data.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        code: "NETWORK_ERROR",
      };
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();

    return this.request<{
      access_token: string;
      user: User;
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
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
      this.setRefreshToken(response.data.refresh_token);
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
      this.setRefreshToken(response.data.refresh_token);
    }

    return response;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      try {
        await this.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    this.setToken(null);
    this.setRefreshToken(null);
    return { success: true };
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

  async getUserRoles() {
    return this.request<UserRole>("/auth/role");
  }

  async getGames() {
    return this.request<Game[]>("/games");
  }

  async getCategories() {
    return this.request<Categories[]>("/categories");
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

  async uploadImage(file: File, folder: string = "images") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return this.request<{ url: string }>("/upload/image", {
      method: "POST",
      body: formData,
    });
  }

  async getAdminStats() {
    return this.request<AdminStats>("/admin/stats");
  }

  async createGame(data: FormData) {
    return this.request<Game>("/admin/games", {
      method: "POST",
      body: data,
    });
  }

  async updateGame(id: string, data: FormData) {
    return this.request<Game>(`/admin/games/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteGame(id: string) {
    return this.request(`/admin/games/${id}`, {
      method: "DELETE",
    });
  }

  async getAllProducts() {
    return this.request<Product[]>("/admin/products");
  }

  async createProduct(data: FormData) {
    return this.request<Product>("/admin/products", {
      method: "POST",
      body: data,
    });
  }

  async updateProduct(id: string, data: FormData) {
    return this.request<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  async getAllTransactions() {
    return this.request<Transaction[]>("/admin/transactions");
  }

  async updateTransactionStatus(id: string, status: string) {
    return this.request<Transaction>(`/admin/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async updatePaymentChannel(code: string, data: Partial<PaymentChannel>) {
    return this.request<PaymentChannel>(`/admin/payment/channels/${code}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
  publisher: string;
  icon_url: string;
  banner_url?: string;
  category: string;
  total_sold: number;
  status: string;
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

export interface UserRole {
  id: string;
  user_id: string;
  code: string;
}

export interface Categories {
  id: string;
  name: string;
  code: string;
}

export interface Product {
  id: string;
  game_id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  icon_url: string;
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
  payment_name?: string;
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

export interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_revenue: number;
  pending_transactions: number;
}

export const api = new ApiClient(API_BASE_URL);
export default api;
