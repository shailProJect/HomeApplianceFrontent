// lib/api.ts — Central API client for Home Services Backend
// Backend runs at http://localhost:8080

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const BASE_URL = "https://home-services-backend-production-a84f.up.railway.app";

// ─── Token helpers ──────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: StoredUser) {
  localStorage.setItem("user", JSON.stringify(user));
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Try refresh
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retried.ok) {
        const err = await retried.json().catch(() => ({}));
        throw new Error(err?.message || "Request failed after refresh");
      }
      return retried.json();
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }

  // Some endpoints return 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.data?.accessToken) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Types (matching backend DTOs) ─────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerServiceId: string;
  serviceName: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  totalAmount: number;
  address: string;
  notes?: string;
}

export interface ProviderResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio?: string;
  latitude?: number;
  longitude?: number;
  serviceArea?: string;
  verified: boolean;
  rating?: number;
  totalReviews?: number;
}

export interface ProviderServiceResponse {
  id: string;
  providerId: string;
  providerName: string;
  categoryName: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "USER" | "PROVIDER";
    serviceCategory?: string;
    yearsOfExperience?: number;
    serviceArea?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    request<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ─── User API ───────────────────────────────────────────────────────────────
export const userApi = {
  searchByCategory: (category: string) =>
    request<ApiResponse<ProviderServiceResponse[]>>(
      `/user/providers?category=${encodeURIComponent(category)}`
    ),

  findNearby: (lat: number, lng: number, radius = 5) =>
    request<ApiResponse<ProviderResponse[]>>(
      `/user/providers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  createBooking: (body: {
    providerServiceId: string;
    scheduledAt: string;
    address: string;
    notes?: string;
  }) =>
    request<ApiResponse<BookingResponse>>("/user/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/user/bookings"),

  addReview: (body: {
    providerId: string;
    rating: number;
    comment?: string;
  }) =>
    request<ApiResponse<ReviewResponse>>("/user/reviews", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Provider API ────────────────────────────────────────────────────────────
export const providerApi = {
  addService: (body: {
    categoryName: string;
    description?: string;
    price: number;
    durationMinutes: number;
  }) =>
    request<ApiResponse<ProviderServiceResponse>>("/provider/services", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyServices: () =>
    request<ApiResponse<ProviderServiceResponse[]>>("/provider/services"),

  addAvailability: (body: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }) =>
    request<ApiResponse<void>>("/provider/availability", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/provider/bookings"),

  updateBookingStatus: (
    id: string,
    status: "CONFIRMED" | "REJECTED" | "COMPLETED"
  ) =>
    request<ApiResponse<BookingResponse>>(`/provider/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  getAllProviders: () =>
    request<ApiResponse<ProviderResponse[]>>("/admin/providers"),

  approveProvider: (id: string) =>
    request<ApiResponse<ProviderResponse>>(`/admin/providers/${id}/approve`, {
      method: "PUT",
    }),

  getAllUsers: () =>
    request<ApiResponse<UserResponse[]>>("/admin/users"),

  getAllBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/admin/bookings"),
};