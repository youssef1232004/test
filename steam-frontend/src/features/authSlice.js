import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminLogin } from "../services/api";

// Check local storage for existing session
const token = localStorage.getItem('adminToken');
const username = localStorage.getItem('adminUsername');
const role = localStorage.getItem('adminRole'); 

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminLogin(credentials);
      // Save to local storage
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUsername', response.data.username);
      localStorage.setItem('adminRole', response.data.role); 
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل تسجيل الدخول. تأكد من البيانات."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token ? token : null,
    username: username ? username : null,
    role: role ? role : null,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminRole');
      state.token = null;
      state.username = null;
      state.role = null; 
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;