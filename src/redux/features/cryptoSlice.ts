import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Kullanıcının portföyündeki bir koin için tip
export interface PortfolioCoin {
  id: string;
  symbol: string;
  amount: number;
  purchasePrice?: number; // Satın alma fiyatı (opsiyonel)
  purchaseDate?: string;  // Satın alma tarihi (opsiyonel)
}

// Aktif/favori para birimleri için tip
export interface FavoriteCoin {
  id: string;
  symbol: string;
  name: string;
}

// Slice state tipi
interface CryptoState {
  portfolio: PortfolioCoin[];
  favorites: FavoriteCoin[];
  selectedCurrency: string;
  selectedTimeRange: string;
  selectedCoin: string | null;
}

// Başlangıç durumu
const initialState: CryptoState = {
  portfolio: [],
  favorites: [],
  selectedCurrency: 'usd',
  selectedTimeRange: '1d',
  selectedCoin: null
};

// Slice oluşturma
export const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    // Portföye koin ekleme
    addCoinToPortfolio: (state, action: PayloadAction<PortfolioCoin>) => {
      const { id, amount } = action.payload;
      const existingCoinIndex = state.portfolio.findIndex(coin => coin.id === id);
      
      if (existingCoinIndex !== -1) {
        // Varolan koini güncelle
        state.portfolio[existingCoinIndex].amount += amount;
      } else {
        // Yeni koin ekle
        state.portfolio.push(action.payload);
      }
    },

    // Portföyden koin çıkarma
    removeCoinFromPortfolio: (state, action: PayloadAction<{ id: string, amount?: number }>) => {
      const { id, amount } = action.payload;
      const existingCoinIndex = state.portfolio.findIndex(coin => coin.id === id);
      
      if (existingCoinIndex !== -1) {
        if (amount) {
          // Belirli bir miktar çıkar
          const newAmount = state.portfolio[existingCoinIndex].amount - amount;
          if (newAmount <= 0) {
            // Miktar 0 veya negatif ise koini tamamen kaldır
            state.portfolio = state.portfolio.filter(coin => coin.id !== id);
          } else {
            // Miktar güncelle
            state.portfolio[existingCoinIndex].amount = newAmount;
          }
        } else {
          // Tüm koini kaldır
          state.portfolio = state.portfolio.filter(coin => coin.id !== id);
        }
      }
    },

    // Favorilere koin ekleme
    addCoinToFavorites: (state, action: PayloadAction<FavoriteCoin>) => {
      const existsInFavorites = state.favorites.some(coin => coin.id === action.payload.id);
      if (!existsInFavorites) {
        state.favorites.push(action.payload);
      }
    },

    // Favorilerden koin çıkarma
    removeCoinFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(coin => coin.id !== action.payload);
    },

    // Seçilen para birimini ayarlama
    setSelectedCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },

    // Seçilen zaman aralığını ayarlama
    setSelectedTimeRange: (state, action: PayloadAction<string>) => {
      state.selectedTimeRange = action.payload;
    },

    // Seçilen koini ayarlama
    setSelectedCoin: (state, action: PayloadAction<string | null>) => {
      state.selectedCoin = action.payload;
    }
  }
});

// Action creator'ları dışa aktar
export const {
  addCoinToPortfolio,
  removeCoinFromPortfolio,
  addCoinToFavorites,
  removeCoinFromFavorites,
  setSelectedCurrency,
  setSelectedTimeRange,
  setSelectedCoin
} = cryptoSlice.actions;

// Selectors
export const selectPortfolio = (state: RootState) => state.crypto.portfolio;
export const selectFavorites = (state: RootState) => state.crypto.favorites;
export const selectSelectedCurrency = (state: RootState) => state.crypto.selectedCurrency;
export const selectSelectedTimeRange = (state: RootState) => state.crypto.selectedTimeRange;
export const selectSelectedCoin = (state: RootState) => state.crypto.selectedCoin;

// Reducer'ı dışa aktar
export default cryptoSlice.reducer; 