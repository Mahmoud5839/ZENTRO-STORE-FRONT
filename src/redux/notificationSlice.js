import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotif = {
        id: Date.now(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(newNotif);

      localStorage.setItem("orderNotifications", JSON.stringify(state.notifications));
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;