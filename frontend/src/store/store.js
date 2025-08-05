import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    // Add other reducers here
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
