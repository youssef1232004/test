import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { verifySallaOrder, getSteamGuardCode, recordAccountView } from "../services/api";

// Async Thunk: Fetch Account Data
export const fetchDeliveryData = createAsyncThunk(
  "delivery/fetchData",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await verifySallaOrder(orderId);
      // التعديل هنا: نستخرج الـ warning فقط كـ Text ولا نمرر كائن الـ response بالكامل
      return { 
        orderId, 
        data: response.data.data, 
        warning: response.data.warning // استخراج التنبيه فقط
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "حدث خطأ في الاتصال بالخادم"
      );
    }
  }
);

// Async Thunk: Fetch Steam Guard Code
export const fetchSteamGuard = createAsyncThunk(
  "delivery/fetchSteamGuard",
  async ({ orderId, accountId }, { rejectWithValue }) => {
    try {
      const response = await getSteamGuardCode(orderId, accountId);
      return {
        code: response.data.data.steamGuardCode,
        message: response.data.message,
        accountId // Return accountId to know which one got updated
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "تعذر جلب كود الحماية"
      );
    }
  }
);

// Async Thunk: Record Account View (Tracking)
export const recordView = createAsyncThunk(
  "delivery/recordView",
  async ({ orderId, accountId }, { rejectWithValue }) => {
    try {
      await recordAccountView(orderId, accountId);
      return { accountId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    orderId: null,
    accountData: null,
    steamGuardCode: null,
    steamGuardMessage: null,
    isLoading: false,
    isGuardLoading: false,
    error: null,
    guardError: null,
    warning: null,
  },
  reducers: {
    resetDelivery: (state) => {
      state.orderId = null;
      state.accountData = null;
      state.steamGuardCode = null;
      state.steamGuardMessage = null;
      state.error = null;
      state.guardError = null;
      state.warning = null;
    },
    clearSteamGuard: (state) => {
      state.steamGuardCode = null;
      state.steamGuardMessage = null;
      state.guardError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Delivery Data Cases
      .addCase(fetchDeliveryData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.orderId;
        state.accountData = action.payload.data;
        // التعديل هنا: نقرأ الـ warning مباشرة من الـ payload
        state.warning = action.payload.warning || null;
      })
      .addCase(fetchDeliveryData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Steam Guard Cases
      .addCase(fetchSteamGuard.pending, (state) => {
        state.isGuardLoading = true;
        state.guardError = null;
        state.steamGuardMessage = null;
      })
      .addCase(fetchSteamGuard.fulfilled, (state, action) => {
        state.isGuardLoading = false;
        state.steamGuardCode = action.payload.code;
        state.steamGuardMessage = action.payload.message;
      })
      .addCase(fetchSteamGuard.rejected, (state, action) => {
        state.isGuardLoading = false;
        state.guardError = action.payload;
      });
  },
});

export const { resetDelivery, clearSteamGuard } = deliverySlice.actions;
export default deliverySlice.reducer;