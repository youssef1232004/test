import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAccounts } from "../services/api";

export const fetchAccounts = createAsyncThunk("inventory/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await getAccounts();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "فشل جلب البيانات");
  }
});

const inventorySlice = createSlice({
  name: "inventory",
  initialState: { accounts: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { 
        state.isLoading = true; 
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default inventorySlice.reducer;