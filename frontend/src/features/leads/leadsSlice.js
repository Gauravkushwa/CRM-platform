// src/features/leads/leadsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// If you prefer to explicitly pass token from state, you can use thunkAPI.getState()
// but if you use the axios interceptor above this isn't necessary.

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Option A: rely on axios interceptor (recommended)
      const res = await api.get('/leads');
      return res.data;

      // Option B: explicitly add header using token from state
      // const token = getState().auth?.token || localStorage.getItem('token');
      // const res = await api.get('/leads', { headers: { Authorization: `Bearer ${token}` }});
      // return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/leads', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // keep consistent endpoint path
      const res = await api.put(`/leads/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/leads/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchLeads.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchLeads.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
      .addCase(createLead.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateLead.fulfilled, (s, a) => {
        const idx = s.items.findIndex(i => i.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(deleteLead.fulfilled, (s, a) => { s.items = s.items.filter(i => i.id !== a.payload); });
  }
});

export default leadsSlice.reducer;
