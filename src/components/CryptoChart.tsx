'use client';

import { useEffect, useRef, useState } from 'react';

interface CryptoChartProps {
  symbol: string;
  timeRange: string;
  darkMode?: boolean;
  priority?: boolean;
}

interface PriceData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CacheData {
  data: PriceData;
  timestamp: number;
}

// Global cache for storing price data to reduce API calls
const priceCache: Record<string, CacheData> = {};

// Cache validity duration in milliseconds (20 minutes for free tier)
const CACHE_DURATION = 20 * 60 * 1000;

// API Rate limiting management
let lastRequestTime = 0;
const REQUEST_DELAY = 6000; // 6 seconds between requests (free tier limit is 10-30 calls per minute)

// Küresel hata sayacı
let errorCount = 0;
const MAX_ERRORS = 5;
let errorResetTime = 0;

// Zaman aralığını gün sayısına çevirme fonksiyonu
const timeRangeToDay = (timeRange: string): string => {
  switch (timeRange) {
    case '1h': return '1';
    case '4h': return '1';
    case '12h': return '1';
    case '1d': return '1';
    case '1w': return '7';
    default: return '1';
  }
};



// X ekseni zaman etiketleri için interval hesaplama
const getTimeIntervalForRange = (timeRange: string, timestamp: Date): string => {
  switch (timeRange) {
    case '1h':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '4h':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '12h':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1d':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1w':
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    default:
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

// Veri noktalarını filtreleme fonksiyonu
const filterDataPointsByTimeRange = (data: PriceData, timeRange: string): PriceData => {
  if (!data || !data.prices || data.prices.length === 0) {
    return data;
  }
  
  const now = Date.now();
  
  let filterTime: number;
  switch (timeRange) {
    case '1h':
      filterTime = now - 60 * 60 * 1000; // 1 saat öncesi
      break;
    case '4h':
      filterTime = now - 4 * 60 * 60 * 1000; // 4 saat öncesi
      break;
    case '12h':
      filterTime = now - 12 * 60 * 60 * 1000; // 12 saat öncesi
      break;
    case '1d':
      filterTime = now - 24 * 60 * 60 * 1000; // 1 gün öncesi
      break;
    case '1w':
      filterTime = now - 7 * 24 * 60 * 60 * 1000; // 1 hafta öncesi
      break;
    default:
      filterTime = now - 24 * 60 * 60 * 1000; // Varsayılan 1 gün
  }
  
  return {
    prices: data.prices.filter(item => item[0] >= filterTime),
    market_caps: data.market_caps?.filter(item => item[0] >= filterTime) || [],
    total_volumes: data.total_volumes?.filter(item => item[0] >= filterTime) || []
  };
};

// Demo data generator
const generateDemoData = (timeRange: string, symbolName: string): PriceData => {
  const now = Date.now();
  let startTime: number;
  let pointCount: number;
  let interval: number;
  
  // Configure based on timeRange
  switch (timeRange) {
    case '1h':
      startTime = now - 60 * 60 * 1000;
      pointCount = 60;
      interval = 60 * 1000; // 1 minute
      break;
    case '4h':
      startTime = now - 4 * 60 * 60 * 1000;
      pointCount = 48;
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case '12h':
      startTime = now - 12 * 60 * 60 * 1000;
      pointCount = 72;
      interval = 10 * 60 * 1000; // 10 minutes
      break;
    case '1d':
      startTime = now - 24 * 60 * 60 * 1000;
      pointCount = 24;
      interval = 60 * 60 * 1000; // 1 hour
      break;
    case '1w':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      pointCount = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    default:
      startTime = now - 24 * 60 * 60 * 1000;
      pointCount = 24;
      interval = 60 * 60 * 1000; // 1 hour
  }
  
  // Generate prices based on coin name for consistency
  const basePrice = getBasePriceForSymbol(symbolName);
  const volatility = getVolatilityForSymbol(symbolName);
  
  // Generate random prices with some trend
  const prices: [number, number][] = [];
  const marketCaps: [number, number][] = [];
  const volumes: [number, number][] = [];
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < pointCount; i++) {
    const timestamp = startTime + i * interval;
    // Add some randomness with a slight trend
    const randomChange = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice + randomChange;
    if (currentPrice <= 0) currentPrice = basePrice * 0.1; // Prevent negative prices
    
    prices.push([timestamp, currentPrice]);
    marketCaps.push([timestamp, currentPrice * 1000000]);
    volumes.push([timestamp, currentPrice * 100000 * Math.random()]);
  }
  
  return {
    prices,
    market_caps: marketCaps,
    total_volumes: volumes
  };
};

// Generate realistic base prices for known cryptocurrencies
function getBasePriceForSymbol(symbol: string): number {
  const symbolLower = symbol.toLowerCase();
  
  if (symbolLower.includes('bitcoin') || symbolLower === 'btc') return 30000 + Math.random() * 10000;
  if (symbolLower.includes('ethereum') || symbolLower === 'eth') return 2000 + Math.random() * 500;
  if (symbolLower.includes('binancecoin') || symbolLower === 'bnb') return 300 + Math.random() * 50;
  if (symbolLower.includes('ripple') || symbolLower === 'xrp') return 0.5 + Math.random() * 0.2;
  if (symbolLower.includes('cardano') || symbolLower === 'ada') return 0.3 + Math.random() * 0.1;
  if (symbolLower.includes('solana') || symbolLower === 'sol') return 100 + Math.random() * 30;
  if (symbolLower.includes('dogecoin') || symbolLower === 'doge') return 0.06 + Math.random() * 0.02;
  
  // Default for unknown coins
  return 10 + Math.random() * 90;
}

// Generate realistic volatility for known cryptocurrencies
function getVolatilityForSymbol(symbol: string): number {
  const symbolLower = symbol.toLowerCase();
  
  if (symbolLower.includes('bitcoin') || symbolLower === 'btc') return 500;
  if (symbolLower.includes('ethereum') || symbolLower === 'eth') return 100;
  if (symbolLower.includes('binancecoin') || symbolLower === 'bnb') return 20;
  if (symbolLower.includes('ripple') || symbolLower === 'xrp') return 0.05;
  if (symbolLower.includes('cardano') || symbolLower === 'ada') return 0.03;
  if (symbolLower.includes('solana') || symbolLower === 'sol') return 10;
  if (symbolLower.includes('dogecoin') || symbolLower === 'doge') return 0.01;
  
  // Default for unknown coins
  return 5;
}

export default function CryptoChart({ symbol, timeRange, darkMode = false, priority = false }: CryptoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  
  // API'dan fiyat geçmişi verilerini çekme
  const days = timeRangeToDay(timeRange);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Arka arkaya çok fazla hata olursa, bir süre demo verileri kullan
      if (errorCount >= MAX_ERRORS && Date.now() < errorResetTime) {
        console.log(`Too many API errors, using demo data until ${new Date(errorResetTime).toLocaleTimeString()}`);
        setIsUsingDemoData(true);
        setPriceData(generateDemoData(timeRange, symbol));
        setIsLoading(false);
        return;
      }
      
      // Önce önbellekten kontrol et
      const cacheKey = `${symbol}_${timeRange}`;
      const cachedData = priceCache[cacheKey];
      
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        // Use cached data
        console.log(`Using cached data for ${symbol} (${timeRange}), cache age: ${Math.round((Date.now() - cachedData.timestamp) / 1000)}s`);
        setPriceData(cachedData.data);
        setIsUsingCachedData(true);
        setIsUsingDemoData(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Rate limit için istek zamanını kontrol et
        const now = Date.now();
        const timeToWait = Math.max(0, (lastRequestTime + REQUEST_DELAY) - now);
        
        if (timeToWait > 0 && !priority) {
          console.log(`Waiting ${timeToWait}ms before making API request to avoid rate limiting`);
          await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        
        // CoinGecko Free API kullan (proxy üzerinden)
        const apiUrl = `/api/coingecko/coins/${encodeURIComponent(symbol)}/market_chart?vs_currency=usd&days=${days}`;
        console.log(`Fetching chart data from: ${apiUrl}`);
        
        // İstek zamanını güncelle
        lastRequestTime = Date.now();
        
        const response = await fetch(apiUrl);
        
        // API hata durumlarını kontrol et
        if (response.status === 429) { // Rate limiting
          console.warn(`Rate limit exceeded (429). Using cached or demo data.`);
          errorCount++;
          
          if (errorCount >= MAX_ERRORS) {
            errorResetTime = Date.now() + 15 * 60 * 1000; // 15 dakika bekle
          }
          
          // Önbellekte veri varsa kullan
          if (cachedData) {
            console.log(`Using expired cached data due to rate limiting`);
            setPriceData(cachedData.data);
            setIsUsingCachedData(true);
            setIsUsingDemoData(false);
          } else {
            // Yoksa demo verileri kullan
            console.log(`No cached data available, using demo data`);
            setPriceData(generateDemoData(timeRange, symbol));
            setIsUsingDemoData(true);
            setIsUsingCachedData(false);
          }
          
          setIsLoading(false);
          return;
        }
        
        if (response.status === 401 || response.status === 403) { // Yetkilendirme hatası
          console.warn(`Authentication error (${response.status}). Using cached or demo data.`);
          errorCount++;
          
          if (errorCount >= MAX_ERRORS) {
            errorResetTime = Date.now() + 15 * 60 * 1000; // 15 dakika bekle
          }
          
          // Önbellekte veri varsa kullan
          if (cachedData) {
            console.log(`Using expired cached data due to auth error`);
            setPriceData(cachedData.data);
            setIsUsingCachedData(true);
            setIsUsingDemoData(false);
          } else {
            // Yoksa demo verileri kullan
            console.log(`No cached data available, using demo data`);
            setPriceData(generateDemoData(timeRange, symbol));
            setIsUsingDemoData(true);
            setIsUsingCachedData(false);
          }
          
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Başarılı cevap, hata sayacını sıfırla
        errorCount = 0;
        
        const data = await response.json() as PriceData;
        
        // Veri doğrulama
        if (!data || !data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
          console.warn('API returned invalid or empty data');
          
          // Önbellekte veri varsa kullan
          if (cachedData) {
            console.log(`Using expired cached data due to invalid API response`);
            setPriceData(cachedData.data);
            setIsUsingCachedData(true);
            setIsUsingDemoData(false);
          } else {
            // Yoksa demo verileri kullan
            console.log(`No cached data available, using demo data`);
            setPriceData(generateDemoData(timeRange, symbol));
            setIsUsingDemoData(true);
            setIsUsingCachedData(false);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Zaman aralığına göre verileri filtrele
        const filteredData = filterDataPointsByTimeRange(data, timeRange);
        
        // Önbelleğe al
        priceCache[cacheKey] = {
          data: filteredData,
          timestamp: Date.now()
        };
        
        setIsUsingCachedData(false);
        setIsUsingDemoData(false);
        setPriceData(filteredData);
        setIsLoading(false);
      } catch (err) {
        console.error(`Error fetching chart data for ${symbol}:`, err);
        errorCount++;
        
        if (errorCount >= MAX_ERRORS) {
          errorResetTime = Date.now() + 15 * 60 * 1000; // 15 dakika bekle
        }
        
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Önbellekte veri varsa kullan
        const cachedData = priceCache[`${symbol}_${timeRange}`];
        if (cachedData) {
          console.log(`Using expired cached data due to fetch error`);
          setPriceData(cachedData.data);
          setIsUsingCachedData(true);
          setIsUsingDemoData(false);
        } else {
          // Yoksa demo verileri kullan
          console.log(`No cached data available, using demo data`);
          setPriceData(generateDemoData(timeRange, symbol));
          setIsUsingDemoData(true);
          setIsUsingCachedData(false);
        }
        
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [symbol, days, timeRange, priority]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !priceData || !priceData.prices) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutlarını ayarla
    const setCanvasSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      // Grafik pixel ratio ayarı
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };

    const { width, height } = setCanvasSize() || { width: 0, height: 0 };
    if (!width || !height) return;
    
    // Verileri hazırla
    const prices = priceData.prices.map((item: [number, number]) => item[1]);
    const timestamps = priceData.prices.map((item: [number, number]) => new Date(item[0]));
    
    if (prices.length === 0) return;
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Arkaplan çiz
    ctx.fillStyle = darkMode ? '#121319' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Eğer cached veya demo veri kullanıyorsak, göster
    if (isUsingCachedData || isUsingDemoData) {
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      
      if (isUsingDemoData) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.fillText('Using simulated data - API access limited', 10, 16);
      } else if (isUsingCachedData) {
        ctx.fillStyle = 'rgba(100, 100, 255, 0.7)';
        ctx.fillText('Using cached data', 10, 16);
      }
    }
    
    // Fiyat serisi çiz
    ctx.beginPath();
    ctx.strokeStyle = '#2962FF';
    ctx.lineWidth = 2;
    
    // Grafik alanını hesapla (sınırlar için margin)
    const margin = { top: 30, right: 10, bottom: 30, left: 60 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    if (prices.length === 0) return;
    
    // İlk nokta
    const x0 = margin.left + (0 / (prices.length - 1)) * graphWidth;
    const y0 = margin.top + graphHeight - ((prices[0] - minPrice) / priceRange) * graphHeight;
    ctx.moveTo(x0, y0);
    
    // Diğer noktalar
    for (let i = 1; i < prices.length; i++) {
      const x = margin.left + (i / (prices.length - 1)) * graphWidth;
      const y = margin.top + graphHeight - ((prices[i] - minPrice) / priceRange) * graphHeight;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Area dolgusu ekle
    const lastX = margin.left + graphWidth;
    const lastY = margin.top + graphHeight;
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(margin.left, lastY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(41, 98, 255, 0.1)';
    ctx.fill();
    
    // Y ekseni fiyat etiketleri
    ctx.fillStyle = darkMode ? '#d1d4dc' : '#191919';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
      const price = minPrice + (priceRange * i) / numYLabels;
      const y = margin.top + graphHeight - (i / numYLabels) * graphHeight;
      
      // Izgarayı çiz
      ctx.strokeStyle = darkMode ? '#272b3b' : '#f0f3fa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      
      // Etiketi çiz
      ctx.fillText(
        price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        margin.left - 5,
        y + 4
      );
    }
    
    // X ekseni zaman etiketleri
    ctx.textAlign = 'center';
    
    // Zaman aralığına göre uygun sayıda etiket seç
    let numXLabels;
    switch(timeRange) {
      case '1h': numXLabels = 6; break;  // 10 dakika aralıklarla
      case '4h': numXLabels = 8; break;  // 30 dakika aralıklarla
      case '12h': numXLabels = 6; break; // 2 saat aralıklarla
      case '1d': numXLabels = 8; break;  // 3 saat aralıklarla
      case '1w': numXLabels = 7; break;  // Günlük
      default: numXLabels = 6;
    }
    
    const labelStep = Math.max(1, Math.floor(timestamps.length / numXLabels));
    
    for (let i = 0; i < timestamps.length; i += labelStep) {
      const x = margin.left + (i / (timestamps.length - 1)) * graphWidth;
      const timestamp = timestamps[i];
      
      // Format label according to time range
      const label = getTimeIntervalForRange(timeRange, timestamp);
      
      ctx.fillText(label, x, height - 10);
    }
    
    // Window resize olayını dinle
    const handleResize = () => {
      setCanvasSize();
      // Yeniden çiz
      setTimeout(() => {
        // Rerun this effect
        const event = new Event('resize');
        window.dispatchEvent(event);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [priceData, darkMode, timeRange, isUsingCachedData, isUsingDemoData]);

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Hata durumu (sadece veri yoksa göster)
  if (error && !priceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">
          <p>Fiyat verileri yüklenirken bir hata oluştu.</p>
          <p className="text-sm">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
} 