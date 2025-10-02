import axios from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for optimization requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `[API] Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] Response received from ${response.config.url}:`,
      response.status
    );
    return response;
  },
  (error) => {
    console.error(
      "[API] Response error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export interface OptimizationRequest {
  grocery_list: string;
  location: string;
  max_stores?: number;
  time_weight?: number;
  price_weight?: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface RouteStore {
  store_id: string;
  retailer_id: string;
  name: string;
  address: string;
  suburb: string;
  postcode: string;
  location: Location;
}

export interface RouteItem {
  item_requested: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface StoreBasket {
  store_info: RouteStore;
  items: RouteItem[];
  subtotal: number;
  click_collect_eligible: boolean;
  min_spend_required: number;
}

export interface ShoppingPlan {
  plan_id?: string;
  total_cost: number;
  total_time: number;
  travel_time: number;
  shopping_time: number;
  num_stores: number;
  route_score: number;
  store_baskets: StoreBasket[];
  generated_at?: string;
}

export interface OptimizationResponse {
  plan: ShoppingPlan;
  success: boolean;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

// API Service Functions
export const apiService = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get("/health");
    return response.data;
  },

  // Optimization endpoint
  async optimizeShoppingPlan(
    request: OptimizationRequest
  ): Promise<OptimizationResponse> {
    const response = await api.post("/api/v1/optimization/optimize", request);
    return response.data;
  },

  // Parse shopping list (if needed separately)
  async parseShoppingList(
    groceryList: string,
    location: string
  ): Promise<OptimizationResponse> {
    const response = await api.post("/api/v1/optimization/parse", {
      grocery_list: groceryList,
      location: location,
    });
    return response.data;
  },

  // Get optimization status
  async getOptimizationStatus(): Promise<{
    status: string;
    progress?: number;
  }> {
    const response = await api.get("/api/v1/optimization/status");
    return response.data;
  },
};

export default api;
