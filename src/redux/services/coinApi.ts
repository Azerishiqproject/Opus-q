import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// CoinGecko API ücretsiz sürümü dakikada 10-50 istek limiti sunar
// API key'i .env dosyasından al
const API_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || '/api/coingecko';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';

// API istekleri için parametreleri hazırlama
const prepareHeaders = (headers: Headers) => {
  // API key varsa header'a ekle
  if (API_KEY) {
    headers.set('x-cg-pro-api-key', API_KEY);
  }
  
  // CORS için ek header'lar
  headers.set('Accept', 'application/json');
  
  return headers;
};

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
}

// Simple coin interface for search results
export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

// Search API response
interface SearchResponse {
  coins: CoinSearchResult[];
}

// Define interfaces for CoinGecko API responses
interface CoinDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    fully_diluted_valuation?: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: {
      usd: number;
    };
    ath_change_percentage: {
      usd: number;
    };
    ath_date: {
      usd: string;
    };
    atl: {
      usd: number;
    };
    atl_change_percentage: {
      usd: number;
    };
    atl_date: {
      usd: string;
    };
    last_updated: string;
    price_change_percentage_1h_in_currency?: {
      usd: number;
    };
    price_change_percentage_24h_in_currency?: {
      usd: number;
    };
    price_change_percentage_7d_in_currency?: {
      usd: number;
    };
  };
}

interface PriceHistoryResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export const coinApi = createApi({
  reducerPath: 'coinApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    prepareHeaders,
    mode: 'cors',
    credentials: 'same-origin'
  }),
  // CoinGecko API'nin istek sınırları nedeniyle, önbelleğe alma ve refetch stratejisi
  keepUnusedDataFor: 300, // verileri 5 dakika önbellekte tut
  refetchOnMountOrArgChange: 300, // bileşen yüklendiğinde veya argümanlar değiştiğinde 5 dakikadan fazla ise yeniden getir
  refetchOnFocus: false, // sekme odağı değiştiğinde otomatik yeniden getirme
  refetchOnReconnect: false, // yeniden bağlandığında otomatik yeniden getirme
  endpoints: (builder) => ({
    getCoins: builder.query<Coin[], void>({
      query: () => ({
        url: '/coins/markets',
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d'
        }
      }),
      // Otomatik yeniden getirme stratejisi
      // İstek sınırlarını aşmamak için 60 saniyede bir yenileme
      keepUnusedDataFor: 60, // verileri 60 saniye önbellekte tut
    }),
    // Search for coins by keyword
    searchCoins: builder.query<CoinSearchResult[], string>({
      query: (query) => ({
        url: '/search',
        params: {
          query
        }
      }),
      transformResponse: (response: SearchResponse) => {
        return response.coins;
      },
      keepUnusedDataFor: 60, // 1 minute cache
    }),
    getCoinById: builder.query<Coin, string>({
      query: (id) => ({
        url: `/coins/${id}`,
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      }),
      transformResponse: (response: CoinDetailResponse): Coin => {
        return {
          id: response.id,
          symbol: response.symbol,
          name: response.name,
          image: response.image.large,
          current_price: response.market_data.current_price.usd,
          market_cap: response.market_data.market_cap.usd,
          market_cap_rank: response.market_cap_rank,
          fully_diluted_valuation: response.market_data.fully_diluted_valuation?.usd || null,
          total_volume: response.market_data.total_volume.usd,
          high_24h: response.market_data.high_24h.usd,
          low_24h: response.market_data.low_24h.usd,
          price_change_24h: response.market_data.price_change_24h,
          price_change_percentage_24h: response.market_data.price_change_percentage_24h,
          market_cap_change_24h: response.market_data.market_cap_change_24h,
          market_cap_change_percentage_24h: response.market_data.market_cap_change_percentage_24h,
          circulating_supply: response.market_data.circulating_supply,
          total_supply: response.market_data.total_supply,
          max_supply: response.market_data.max_supply,
          ath: response.market_data.ath.usd,
          ath_change_percentage: response.market_data.ath_change_percentage.usd,
          ath_date: response.market_data.ath_date.usd,
          atl: response.market_data.atl.usd,
          atl_change_percentage: response.market_data.atl_change_percentage.usd,
          atl_date: response.market_data.atl_date.usd,
          last_updated: response.market_data.last_updated,
          price_change_percentage_1h_in_currency: response.market_data.price_change_percentage_1h_in_currency?.usd,
          price_change_percentage_24h_in_currency: response.market_data.price_change_percentage_24h_in_currency?.usd,
          price_change_percentage_7d_in_currency: response.market_data.price_change_percentage_7d_in_currency?.usd,
        };
      },
      // Detaylı kripto para bilgileri daha az sıklıkla değişebilir
      keepUnusedDataFor: 300, // 5 dakika
    }),
    // Coin fiyat geçmişi için endpoint
    getCoinPriceHistory: builder.query<PriceHistoryResponse, { id: string; days: number | string }>({
      query: ({ id, days }) => ({
        url: `/coins/${id}/market_chart`,
        params: {
          vs_currency: 'usd',
          days: days
        }
      }),
      keepUnusedDataFor: 300, // 5 dakika
    }),
  }),
});

export const { 
  useGetCoinsQuery, 
  useGetCoinByIdQuery,
  useGetCoinPriceHistoryQuery,
  useSearchCoinsQuery
} = coinApi; 