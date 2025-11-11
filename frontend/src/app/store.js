
import authReducer from '../features/auth/authSlice'
import { configureStore } from '@reduxjs/toolkit';
import leadsReducer from '../features/leads/leadsSlice';
import activitiesReducer from '../features/activites/activitiesSlice';


const store = configureStore({
reducer: { leads: leadsReducer, activities: activitiesReducer, auth: authReducer },
});

export default store