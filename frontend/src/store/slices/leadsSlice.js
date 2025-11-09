import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../../services/api'

export const fetchLeads = createAsyncThunk('leads/fetch', async (params = {}) => {
  const res = await api.getLeads(params)
  return res.data
})

export const fetchLead = createAsyncThunk('leads/fetchOne', async (id) => {
  const res = await api.getLead(id)
  return res.data
})

export const createNewLead = createAsyncThunk('leads/create', async (data) => {
  const res = await api.createLead(data)
  return res.data
})

export const addActivity = createAsyncThunk('leads/addActivity', async (data) => {
  const res = await api.addActivity(data)
  return res.data
})

const slice = createSlice({
  name: 'leads',
  initialState: { items: [], selected: null, loading: false, error: null, total: 0 },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchLeads.pending, (s) => { s.loading = true })
    b.addCase(fetchLeads.fulfilled, (s, a) => {
      s.loading = false
      s.items = a.payload.items
      s.total = a.payload.total
    })
    b.addCase(fetchLeads.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

    b.addCase(fetchLead.pending, (s) => { s.loading = true })
    b.addCase(fetchLead.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload })
    b.addCase(fetchLead.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

    b.addCase(createNewLead.fulfilled, (s, a) => { s.items.unshift(a.payload) })
    b.addCase(addActivity.fulfilled, (s, a) => {
      // append activity to selected if matches
      if (s.selected && s.selected.id === a.payload.leadId) {
        s.selected.activities = [a.payload, ...s.selected.activities]
      }
    })
  }
})

export default slice.reducer
