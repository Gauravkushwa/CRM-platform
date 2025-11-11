import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'


export const login = createAsyncThunk('auth/login', async (credentials) => {
const { data } = await api.post('/auth/login', credentials)
return data
})


export const register = createAsyncThunk('auth/register', async (payload) => {
// payload: { name, email, password, role }
const { data } = await api.post('/auth/register', payload)
return data
})


const slice = createSlice({
name: 'auth',
initialState: { user: null, status: 'idle', error: null },
reducers: {
logout(state) {
state.user = null
},
setUser(state, action) {
state.user = action.payload
}
},
extraReducers(builder) {
builder
.addCase(login.pending, (state) => { state.status = 'loading' })
.addCase(login.fulfilled, (state, action) => { state.status = 'succeeded'; state.user = action.payload })
.addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message })
.addCase(register.pending, (state) => { state.status = 'loading' })
.addCase(register.fulfilled, (state, action) => { state.status = 'succeeded'; state.user = action.payload })
.addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message })
}
})


export const { logout, setUser } = slice.actions
export default slice.reducer