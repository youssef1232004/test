import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers } from "../services/api";

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsers();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل جلب بيانات الموظفين"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: { users: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;