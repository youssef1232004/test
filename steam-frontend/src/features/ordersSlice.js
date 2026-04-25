import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrders } from "../services/api";

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrders();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل جلب بيانات الطلبات",
      );
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: { orders: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default ordersSlice.reducer;
