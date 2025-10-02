import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import householdReducer from './slices/householdSlice';
import residentReducer from './slices/residentSlice';
import feeReducer from './slices/feeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    household: householdReducer,
    resident: residentReducer,
    fee: feeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;