import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api.js';


export const fetchActivities = createAsyncThunk('activities/fetchActivities', async (leadId, { rejectWithValue }) => {
try { const res = await api.get(`/api/leads/${leadId}/activities`); return { leadId, items: res.data }; } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});
export const createActivity = createAsyncThunk('activities/createActivity', async ({ leadId, payload }, { rejectWithValue }) => {
try { const res = await api.post(`/api/leads/${leadId}/activities`, payload); return { leadId, activity: res.data }; } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});
export const updateActivity = createAsyncThunk('activities/updateActivity', async ({ leadId, id, data }, { rejectWithValue }) => {
try { const res = await api.put(`/api/leads/${leadId}/activities/${id}`, data); return { leadId, activity: res.data }; } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});
export const deleteActivity = createAsyncThunk('activities/deleteActivity', async ({ leadId, id }, { rejectWithValue }) => {
try { await api.delete(`/api/leads/${leadId}/activities/${id}`); return { leadId, id }; } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});


const activitiesSlice = createSlice({
name: 'activities',
initialState: { byLead: {}, status: 'idle', error: null },
reducers: {},
extraReducers: (builder) => {
builder
.addCase(fetchActivities.pending, (s) => { s.status = 'loading'; })
.addCase(fetchActivities.fulfilled, (s, a) => { s.status = 'succeeded'; s.byLead[a.payload.leadId] = a.payload.items; })
.addCase(fetchActivities.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
.addCase(createActivity.fulfilled, (s, a) => { const arr = s.byLead[a.payload.leadId] || []; arr.unshift(a.payload.activity); s.byLead[a.payload.leadId] = arr; })
.addCase(updateActivity.fulfilled, (s, a) => { const arr = s.byLead[a.payload.leadId] || []; const idx = arr.findIndex(x => x.id === a.payload.activity.id); if (idx !== -1) arr[idx] = a.payload.activity; s.byLead[a.payload.leadId] = arr; })
.addCase(deleteActivity.fulfilled, (s, a) => { const arr = s.byLead[a.payload.leadId] || []; s.byLead[a.payload.leadId] = arr.filter(x => x.id !== a.payload.id); });
}
});
export default activitiesSlice.reducer;