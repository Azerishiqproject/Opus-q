import { configureStore } from '@reduxjs/toolkit';
import { coinApi } from './services/coinApi';
import cryptoReducer from './features/cryptoSlice';

export const store = configureStore({
  reducer: {
    [coinApi.reducerPath]: coinApi.reducer,
    crypto: cryptoReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(coinApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 