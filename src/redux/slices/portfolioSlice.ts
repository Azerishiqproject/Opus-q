import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, localDb } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { IconType } from 'react-icons';

// Interface for portfolio data
export interface PortfolioItem {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  icon?: IconType;
  bgColor?: string;
  price?: string;
  percentChange?: string;
  isPositive?: boolean;
}

interface PortfolioState {
  items: PortfolioItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  useLocalStorage: boolean;
}

// Initial state
const initialState: PortfolioState = {
  items: [],
  status: 'idle',
  error: null,
  useLocalStorage: false
};

// Helper function to get a user ID (in a real app, this would come from auth)
const getUserId = () => {
  // For now, we'll use a hardcoded user ID
  return 'default-user';
};

// Helper to strip non-serializable properties from portfolio items
const prepareForFirestore = (item: PortfolioItem): Omit<PortfolioItem, 'icon'> => {
  // Remove icon which is a React component (non-serializable)
  const {  ...rest } = item;
  return rest;
};

// Async thunks for Firebase operations
export const fetchUserPortfolio = createAsyncThunk(
  'portfolio/fetchUserPortfolio',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log("Fetching portfolio...");
      const userId = getUserId();
      
      try {
        // First try with Firestore
        const portfolioRef = doc(db, 'portfolio', userId);
        const portfolioDoc = await getDoc(portfolioRef);
        
        if (portfolioDoc.exists()) {
          console.log("Portfolio found in Firestore:", portfolioDoc.data());
          return portfolioDoc.data().coins as PortfolioItem[];
        } else {
          // If no portfolio exists yet, create one
          console.log("No portfolio found in Firestore, creating new one");
          await setDoc(portfolioRef, { coins: [] });
          return [] as PortfolioItem[];
        }
      } catch (firebaseError) {
        console.error("Firestore error, falling back to localStorage:", firebaseError);
        
        // If Firestore fails, try localStorage
        const localData = localDb.getPortfolio(userId);
        console.log("Portfolio from localStorage:", localData);
        
        // Mark that we should use localStorage
        dispatch(setUseLocalStorage(true));
        
        return localData.coins || [];
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addCoinToPortfolio = createAsyncThunk(
  'portfolio/addCoinToPortfolio',
  async (coin: PortfolioItem, { rejectWithValue, getState }) => {
    try {
      console.log("Adding coin to portfolio:", coin.name);
      const userId = getUserId();
      
      // Prepare the coin for storage (remove non-serializable properties)
      const serializableCoin = prepareForFirestore(coin);
      console.log("Serialized coin for storage:", serializableCoin);
      
      const state = getState() as { portfolio: PortfolioState };
      const useLocalStorage = state.portfolio.useLocalStorage;

      if (!useLocalStorage) {
        try {
          // Try Firestore first
          const portfolioRef = doc(db, 'portfolio', userId);
          const portfolioDoc = await getDoc(portfolioRef);
          
          if (portfolioDoc.exists()) {
            console.log("Updating existing portfolio in Firestore");
            // Update existing portfolio
            await updateDoc(portfolioRef, {
              coins: arrayUnion(serializableCoin)
            });
          } else {
            console.log("Creating new portfolio with coin in Firestore");
            // Create new portfolio
            await setDoc(portfolioRef, {
              coins: [serializableCoin]
            });
          }
          
          console.log("Coin added successfully to Firestore");
          return coin;
        } catch (firebaseError) {
          console.error("Firestore error, falling back to localStorage:", firebaseError);
          // If Firestore fails, continue to localStorage
        }
      }
      
      // Use localStorage as fallback
      console.log("Using localStorage for portfolio");
      const existingData = localDb.getPortfolio(userId);
      existingData.coins = existingData.coins || [];
      existingData.coins.push(serializableCoin);
      localDb.savePortfolio(userId, existingData);
      
      console.log("Coin added successfully to localStorage");
      return coin;
    } catch (error) {
      console.error("Error adding coin to portfolio:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeCoinFromPortfolio = createAsyncThunk(
  'portfolio/removeCoinFromPortfolio',
  async (coin: PortfolioItem, { rejectWithValue, getState }) => {
    try {
      console.log("Removing coin from portfolio:", coin.id);
      const userId = getUserId();
      
      // Prepare the coin for storage (remove non-serializable properties)
      const serializableCoin = prepareForFirestore(coin);
      
      const state = getState() as { portfolio: PortfolioState };
      const useLocalStorage = state.portfolio.useLocalStorage;

      if (!useLocalStorage) {
        try {
          // Try Firestore first
          const portfolioRef = doc(db, 'portfolio', userId);
          await updateDoc(portfolioRef, {
            coins: arrayRemove(serializableCoin)
          });
          
          console.log("Coin removed successfully from Firestore");
          return coin;
        } catch (firebaseError) {
          console.error("Firestore error, falling back to localStorage:", firebaseError);
          // If Firestore fails, continue to localStorage
        }
      }
      
      // Use localStorage as fallback
      console.log("Using localStorage for portfolio");
      const existingData = localDb.getPortfolio(userId);
      if (existingData.coins && existingData.coins.length > 0) {
        existingData.coins = existingData.coins.filter(
          (item: Omit<PortfolioItem, 'icon'>) => item.id !== coin.id
        );
        localDb.savePortfolio(userId, existingData);
      }
      
      console.log("Coin removed successfully from localStorage");
      return coin;
    } catch (error) {
      console.error("Error removing coin from portfolio:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCoinAmount = createAsyncThunk(
  'portfolio/updateCoinAmount',
  async ({ id, amount }: { id: string; amount: string }, { getState, rejectWithValue }) => {
    try {
      console.log("Updating coin amount:", id, amount);
      const state = getState() as { portfolio: PortfolioState };
      const coin = state.portfolio.items.find(item => item.id === id);
      const useLocalStorage = state.portfolio.useLocalStorage;
      
      if (!coin) {
        throw new Error('Coin not found in portfolio');
      }
      
      const updatedCoin = { ...coin, amount };
      const userId = getUserId();
      
      // Prepare coins for storage (remove non-serializable properties)
      const serializableCoin = prepareForFirestore(coin);
      const serializableUpdatedCoin = prepareForFirestore(updatedCoin);
      
      if (!useLocalStorage) {
        try {
          // Try Firestore first
          const portfolioRef = doc(db, 'portfolio', userId);
          
          // Remove old coin and add updated one
          await updateDoc(portfolioRef, {
            coins: arrayRemove(serializableCoin)
          });
          
          await updateDoc(portfolioRef, {
            coins: arrayUnion(serializableUpdatedCoin)
          });
          
          console.log("Coin amount updated successfully in Firestore");
          return { id, amount };
        } catch (firebaseError) {
          console.error("Firestore error, falling back to localStorage:", firebaseError);
          // If Firestore fails, continue to localStorage
        }
      }
      
      // Use localStorage as fallback
      console.log("Using localStorage for portfolio");
      const existingData = localDb.getPortfolio(userId);
      if (existingData.coins && existingData.coins.length > 0) {
        existingData.coins = existingData.coins.map(
          (item: Omit<PortfolioItem, 'icon'>) => item.id === id ? { ...item, amount } : item
        );
        localDb.savePortfolio(userId, existingData);
      }
      
      console.log("Coin amount updated successfully in localStorage");
      return { id, amount };
    } catch (error) {
      console.error("Error updating coin amount:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the portfolio slice
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolio(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
    setUseLocalStorage(state, action: PayloadAction<boolean>) {
      state.useLocalStorage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchUserPortfolio.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserPortfolio.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUserPortfolio.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Add coin
      .addCase(addCoinToPortfolio.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCoinToPortfolio.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(addCoinToPortfolio.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Remove coin
      .addCase(removeCoinFromPortfolio.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeCoinFromPortfolio.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.id);
      })
      .addCase(removeCoinFromPortfolio.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update coin amount
      .addCase(updateCoinAmount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCoinAmount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id, amount } = action.payload;
        const coin = state.items.find(item => item.id === id);
        if (coin) {
          coin.amount = amount;
        }
      })
      .addCase(updateCoinAmount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { clearPortfolio, setUseLocalStorage } = portfolioSlice.actions;
export default portfolioSlice.reducer; 