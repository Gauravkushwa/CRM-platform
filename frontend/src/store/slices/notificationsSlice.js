import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api"; // adapt if your api client path differs

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await api.get("/activities"); // backend: GET /api/activities
    return res.data;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    status: "idle",
  },
  reducers: {
    addNotification(state, action) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead(state) {
      state.unreadCount = 0;
      state.items = state.items.map(it => ({ ...it, read: true }));
    },
    markRead(state, action) {
      const id = action.payload;
      state.items = state.items.map(it => it.id === id ? { ...it, read: true } : it);
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.status = "loading"; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter(it => !it.read).length || 0;
        state.status = "succeeded";
      })
      .addCase(fetchNotifications.rejected, (state) => { state.status = "failed"; });
  }
});

export const { addNotification, markAllRead, markRead } = notificationSlice.actions;
export default notificationSlice.reducer;
