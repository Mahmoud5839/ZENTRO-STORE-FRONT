import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import cartSlice from './cartSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
    reducer: {
        user: userSlice,
        cart: cartSlice,
        notifications: notificationReducer,
    },
});