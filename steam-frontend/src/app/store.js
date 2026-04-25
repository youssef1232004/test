import { configureStore } from "@reduxjs/toolkit";
import deliveryReducer from "../features/deliverySlice";
import authReducer from "../features/authSlice";
import inventoryReducer from "../features/inventorySlice";
import ordersReducer from "../features/ordersSlice";
import usersReducer from "../features/usersSlice";

export const store = configureStore({
  reducer: {
    delivery: deliveryReducer,
    auth: authReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
    users: usersReducer,
  },
});
