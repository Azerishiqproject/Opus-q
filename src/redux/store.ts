import { configureStore } from '@reduxjs/toolkit';
import { coinApi } from './services/coinApi';
import cryptoReducer from './features/cryptoSlice';
import portfolioReducer from './slices/portfolioSlice';

export const store = configureStore({
  reducer: {
    [coinApi.reducerPath]: coinApi.reducer,
    crypto: cryptoReducer,
    portfolio: portfolioReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(coinApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 