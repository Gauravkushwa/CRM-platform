import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../../services/api'

// load initial
const tokenInit = localStorage.getItem('token') || null
const userInit = JSON.parse(localStorage.getItem('user') || 'null')

export const loginUser = createAsyncThunk('auth/login', async (cred, thunkAPI) => {
  const res = await api.login(cred)
  return res.data
})

export const registerUser = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  const res = await api.register(data)
  return res.data
})

const slice = createSlice({
  name: 'auth',
  initialState: { token: tokenInit, user: userInit, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      api.setToken(null)
    },
    setTokenFromStorage: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      api.setToken(action.payload.token)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false
        s.token = a.payload.token
        s.user = a.payload.user
        localStorage.setItem('token', s.token)
        localStorage.setItem('user', JSON.stringify(s.user))
        api.setToken(s.token)
      })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(registerUser.fulfilled, (s) => { s.loading = false })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
  }
})

export const { logout, setTokenFromStorage } = slice.actions
export default slice.reducer
