// lib/api.ts — Central API client for Home Services Backend
// Backend runs at http://localhost:8080

  // const BASE_URL =  "http://localhost:8080";
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
  phoneVerified?: boolean;
  emailVerified?: boolean;
  phone?: string;
  address?: string;
  profilePhoto?: string;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retried.ok) {
        const err = await retried.json().catch(() => ({})) as { message?: string };
        throw new Error(err?.message || "Request failed after refresh");
      }
      return retried.json();
    } else {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err?.message || `HTTP ${res.status}`);
  }

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
    const data = await res.json() as ApiResponse<AuthResponse>;
    if (data?.data?.accessToken) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Response Types (matching backend DTOs) ───────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  profilePhoto?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
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
  categoryId: string;
  categoryName: string;
  shopName?: string;
  shopAddress?: string;
  experienceYears?: number;
}

/** Full provider detail returned by GET /admin/providers/{id} */
export interface ProviderDetailResponse {
  providerId: string;
  userId: string;
  // user info
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  registeredAt: string;
  userAddress?: string;
  // professional
  categoryId?: string;
  categoryName?: string;
  experienceYears?: number;
  rating?: number;
  // shop / location
  shopName?: string;
  shopAddress?: string;
  serviceArea?: string;
  latitude?: number;
  longitude?: number;
  // documents
  govtIdDocumentUrl?: string;
  businessCertificateUrl?: string;
  addressProofUrl?: string;
  // status
  profilePhotoUrl?: string;
  verified: boolean;
  active: boolean;
  adminNotes?: string;
}

export interface ProviderServiceResponse {
  id: string;
  providerId: string;
  providerName: string;
  categoryName: string;
  description?: string;
  categoryId: string; 
  price: number;
  durationMinutes: number;
  active: boolean;
  serviceName: string;
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

// ─── Request Types ─────────────────────────────────────────────────────────────
export interface RegisterRequest {
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
}

export interface BookingRequest {
  providerServiceId: string;
  startTime: string;
  address: string;
  notes?: string;
  endTime?: string;
  bookingDate?: string;
}

export interface ReviewRequest {
  providerId: string;
  rating: number;
  comment?: string;
}

export interface ProviderServiceRequest {
  categoryId: string;   // ← must be this, not categoryName
  serviceName: string;
  price: number;
  durationMinutes: number;
}
export interface AvailabilityRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
export interface ServiceCategoryResponse {
  id: string;   // UUID — this is what the backend needs as categoryId
  name: string; // e.g. "ELECTRICIAN"
}
 


// ─── Auth API (/auth) ─────────────────────────────────────────────────────────
export const authApi = {
  /** POST /auth/register — Register as USER or PROVIDER */
  register: (body: RegisterRequest) =>
    request<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** POST /auth/login — Login with email + password */
  login: (email: string, password: string) =>
    request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** POST /auth/refresh — Refresh access token */
  refresh: (refreshToken: string) =>
    request<ApiResponse<AuthResponse>>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
    
    verifyEmail: (email: string, otp: string) =>
  request<ApiResponse<string>>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  }),

  resendOtp: (email: string) =>
  request<ApiResponse<string>>(
    "/auth/resend-otp",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  ),

  /** POST /auth/login-phone — Login using Firebase Phone Auth ID token */
  loginWithPhone: (firebaseToken: string) =>
    request<ApiResponse<AuthResponse>>("/auth/login-phone", {
      method: "POST",
      body: JSON.stringify({ firebaseToken }),
    }),
};

export const categoryApi = {
  /** GET /categories — Returns all categories with their UUIDs */
  getAll: () =>
    request<ApiResponse<ServiceCategoryResponse[]>>("/categories"),
};

// ─── User API (/user) — Requires USER role ─────────────────────────────────────
export const userApi = {
  /** GET /user/profile — Get current user profile */
  getProfile: () =>
    request<ApiResponse<UserResponse>>("/user/profile"),

  /** PUT /user/profile — Update name and address */
  updateProfile: (body: { name?: string; address?: string }) =>
    request<ApiResponse<UserResponse>>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

    uploadProfilePhoto: async (file: File) => {

  const token = getToken();

  const formData = new FormData();

  formData.append("profilePhoto", file);

  const res = await fetch(
    `${BASE_URL}/user/profile/photo`,
    {
      method: "PUT",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: formData,
    }
  );

  if (!res.ok) {

    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err?.message || "Upload failed"
    );
  }

  return res.json();
},

  /** POST /user/phone/send-otp — Send OTP to phone */
  // sendPhoneOtp: (phone: string) =>
  //   request<ApiResponse<string>>("/user/phone/send-otp", {
  //     method: "POST",
  //     body: JSON.stringify({ phone }),
  //   }),

  // /** POST /user/phone/verify — Verify phone OTP */
  // verifyPhone: (phone: string, otp: string) =>
  //   request<ApiResponse<UserResponse>>("/user/phone/verify", {
  //     method: "POST",
  //     body: JSON.stringify({ phone, otp }),
  //   }),

  /** GET /user/providers?category=ELECTRICIAN — Search active provider services by category */
  searchByCategory: (category: string) =>
    request<ApiResponse<ProviderServiceResponse[]>>(
      `/user/providers?category=${encodeURIComponent(category)}`
    ),

  /** GET /user/providers/nearby?lat=&lng=&radius=5 — Find nearby providers (Haversine) */
  findNearby: (lat: number, lng: number, radius = 5) =>
    request<ApiResponse<ProviderResponse[]>>(
      `/user/providers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  /** POST /user/bookings — Create a new booking */
  createBooking: (body: BookingRequest) =>
    request<ApiResponse<BookingResponse>>("/user/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /user/bookings — Get current user's bookings */
  getMyBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/user/bookings"),

  /** POST /user/reviews — Submit a review for a provider */
  addReview: (body: ReviewRequest) =>
    request<ApiResponse<ReviewResponse>>("/user/reviews", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /user/providers/{id} — Get a specific provider's public profile */
  getProviderById: (id: string) =>
    request<ApiResponse<ProviderResponse>>(`/user/providers/${id}`),

  /** GET /user/providers/{id}/reviews — Get all reviews for a provider */
  getProviderReviews: (id: string) =>
    request<ApiResponse<ReviewResponse[]>>(`/user/providers/${id}/reviews`),

getChatResponse: (message: string) =>
  request<{
    category: string;
    response: string;
    providers: {
      id: string;
      name: string;
      serviceArea: string;
      experience: number;
    }[];
  }>("/user/chat/ask", {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  }),

  verifyFirebasePhone: (firebaseToken: string) =>
  request<ApiResponse<string>>(
    "/user/phone/firebase-verify",
    {
      method: "POST",
      body: JSON.stringify({
        firebaseToken,
      }),
    }
  ),
};

// ─── Provider API (/provider) — Requires PROVIDER role ───────────────────────
export const providerApi = {
  /** GET /provider/profile — Get provider's own profile */
  getProfile: () =>
    request<ApiResponse<ProviderResponse>>("/provider/profile"),

  /** PUT /provider/active?active=true/false — Toggle active status */
  toggleActive: (active: boolean) =>
    request<ApiResponse<ProviderResponse>>(`/provider/active?active=${active}`, {
      method: "PUT",
    }),

  /** POST /provider/services — Add a new service offering */
  addService: (body: ProviderServiceRequest) =>
    request<ApiResponse<ProviderServiceResponse>>("/provider/services", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /provider/services — Get all services for the authenticated provider */
  getMyServices: () =>
    request<ApiResponse<ProviderServiceResponse[]>>("/provider/services"),

  /** POST /provider/availability — Add an availability slot */
  addAvailability: (body: AvailabilityRequest) =>
    request<ApiResponse<void>>("/provider/availability", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** GET /provider/bookings — Get all bookings for authenticated provider */
  getMyBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/provider/bookings"),

  /** PUT /provider/bookings/{id}/status — Accept, reject, or complete a booking */
  updateBookingStatus: (id: string, status: "CONFIRMED" | "REJECTED" | "COMPLETED") =>
    request<ApiResponse<BookingResponse>>(`/provider/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  /** PUT /provider/profile — Update provider profile (shop name, address, etc.) */
  updateProfile: (body: {
    serviceArea?: string;
    experienceYears?: number;
    latitude?: number;
    longitude?: number;
    shopName?: string;
    shopAddress?: string;
  }) =>
    request<ApiResponse<ProviderResponse>>("/provider/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

    updateService: (id: string, body: ProviderServiceRequest) =>
    request<ApiResponse<ProviderServiceResponse>>(`/provider/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /** POST /provider/documents — Upload verification documents (multipart) */
  uploadDocuments: (files: {
    govtId?: File;
    businessCertificate?: File;
    addressProof?: File;
  }) => {
    const token = getToken();
    const form = new FormData();
    if (files.govtId) form.append("govtId", files.govtId);
    if (files.businessCertificate) form.append("businessCertificate", files.businessCertificate);
    if (files.addressProof) form.append("addressProof", files.addressProof);
    return fetch(`${BASE_URL}/provider/documents`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      return res.json() as Promise<ApiResponse<ProviderDetailResponse>>;
    });
  },
};

// ─── Admin API (/admin) — Requires ADMIN role ─────────────────────────────────
export const adminApi = {
  /** GET /admin/providers — List all providers (verified + unverified) */
  getAllProviders: () =>
    request<ApiResponse<ProviderResponse[]>>("/admin/providers"),

  /** GET /admin/providers/{id} — Full provider detail for review */
  getProviderDetail: (id: string) =>
    request<ApiResponse<ProviderDetailResponse>>(`/admin/providers/${id}`),

  /** PUT /admin/providers/{id}/approve — Verify and approve a provider */
  approveProvider: (id: string) =>
    request<ApiResponse<ProviderDetailResponse>>(`/admin/providers/${id}/approve`, {
      method: "PUT",
    }),

  /** PUT /admin/providers/{id}/reject — Reject provider with optional note */
  rejectProvider: (id: string, notes?: string) =>
    request<ApiResponse<ProviderDetailResponse>>(`/admin/providers/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }),

  /** PUT /admin/providers/{id}/toggle-active — Enable/disable a provider */
  toggleProviderActive: (id: string, active: boolean) =>
    request<ApiResponse<ProviderResponse>>(`/admin/providers/${id}/toggle-active?active=${active}`, {
      method: "PUT",
    }),

  /** GET /admin/reviews -- All reviews */
  getAllReviews: () =>
    request<ApiResponse<ReviewResponse[]>>("/admin/reviews"),

  /** GET /admin/providers/{id}/reviews */
  getProviderReviews: (providerId: string) =>
    request<ApiResponse<ReviewResponse[]>>(`/admin/providers/${providerId}/reviews`),

  /** DELETE /admin/reviews/{id} */
  deleteReview: (id: string) =>
    request<ApiResponse<void>>(`/admin/reviews/${id}`, { method: "DELETE" }),

  /** GET /admin/users — List all registered users */
  getAllUsers: () =>
    request<ApiResponse<UserResponse[]>>("/admin/users"),

  /** GET /admin/bookings — Monitor all bookings platform-wide */
  getAllBookings: () =>
    request<ApiResponse<BookingResponse[]>>("/admin/bookings"),
};