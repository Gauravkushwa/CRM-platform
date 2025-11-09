import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchActivities = createAsyncThunk(
  "activities/fetch",
  async () => {
    const res = await api.get("/activities"); // GET /api/activities
    return res.data;
  }
);

const activitiesSlice = createSlice({
  name: "activities",
  initialState: { items: [], status: "idle" },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchActivities.pending, (state) => { state.status = "loading"; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchActivities.rejected, (state) => { state.status = "failed"; });
  }
});

export default activitiesSlice.reducer;
