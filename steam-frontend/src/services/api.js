import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Interceptor: Automatically attach the Admin JWT token if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Customer Routes
export const verifySallaOrder = (orderId) =>
  API.get(`/verify-order/${orderId}`);
export const getSteamGuardCode = (orderId, accountId = null) =>
  API.get(`/steam-guard/${orderId}${accountId ? `?accountId=${accountId}` : ""}`);
export const recordAccountView = (orderId, accountId) =>
  API.post(`/record-view/${orderId}/${accountId}`);

// Admin Auth Routes
export const adminLogin = (credentials) =>
  API.post("/admin/login", credentials);

// Admin Inventory Routes
export const getAccounts = () => API.get("/admin/accounts");
export const addAccount = (accountData) =>
  API.post("/admin/accounts", accountData);
export const toggleAccount = (id) => API.put(`/admin/accounts/${id}/toggle`);
export const deleteAccount = (id) => API.delete(`/admin/accounts/${id}`);
export const getAdminCode = (id) =>
  API.get(`/admin/accounts/${id}/steam-guard`);
export const updateAccountData = (id, data) =>
  API.put(`/admin/accounts/${id}`, data);

// Admin Order Routes
export const getOrders = () => API.get("/admin/orders");
export const topUpOrder = (refId, sku) =>
  API.put(`/admin/orders/${refId}/top-up`, { sku });
export const revokeOrder = (refId, sku, reason = "") =>
  API.put(`/admin/orders/${refId}/revoke`, { sku, reason });

// Admin User/Profile Routes
export const updateProfile = (data) => API.put("/admin/profile", data);
export const getUsers = () => API.get("/admin/users");
export const createUser = (data) => API.post("/admin/users", data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

export default API;
