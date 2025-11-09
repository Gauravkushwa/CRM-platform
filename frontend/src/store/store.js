import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import leadsReducer from './slices/leadsSlice'
import notificationsReducer from './slices/notificationsSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
    notifications: notificationsReducer
  }
})
