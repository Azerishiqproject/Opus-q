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

// Cache validity duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Zaman aralığını gün sayısına çevirme fonksiyonu
const timeRangeToDay = (timeRange: string): number | string => {
  switch (timeRange) {
    case '1h': return '1';
    case '3h': return '1';
    case '1d': return '1';
    case '1w': return '7';
    case '1m': return '30';
    case '3m': return '90';
    case '6m': return '180';
    case '1y': return '365';
    case 'all': return 'max';
    default: return '1';
  }
};

// X ekseni zaman etiketleri için interval hesaplama
const getTimeIntervalForRange = (timeRange: string, timestamp: Date): string => {
  switch (timeRange) {
    case '1h':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '3h':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1d':
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1w':
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case '1m':
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    default:
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default function CryptoChart({ symbol, timeRange, darkMode = false, priority = false }: CryptoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // API'dan fiyat geçmişi verilerini çekme
  const days = timeRangeToDay(timeRange);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const cacheKey = `${symbol}_${days}`;
      const cachedData = priceCache[cacheKey];
      
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        // Use cached data
        setPriceData(cachedData.data);
        setIsLoading(false);
        return;
      }
      
      try {
        // If this chart is not priority, add a small delay to avoid rate limiting
        if (!priority) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json() as PriceData;
        
        // Update the cache
        priceCache[cacheKey] = {
          data,
          timestamp: Date.now()
        };
        
        setPriceData(data);
        setIsLoading(false);
      } catch (err) {
        console.error(`Error fetching chart data for ${symbol}:`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [symbol, days, priority]);

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
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Arkaplan çiz
    ctx.fillStyle = darkMode ? '#121319' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Fiyat serisi çiz
    ctx.beginPath();
    ctx.strokeStyle = '#2962FF';
    ctx.lineWidth = 2;
    
    // Grafik alanını hesapla (sınırlar için margin)
    const margin = { top: 30, right: 10, bottom: 30, left: 60 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
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
    const numXLabels = timeRange === '1h' || timeRange === '3h' ? 6 : 5;
    const labelStep = Math.floor(timestamps.length / numXLabels);
    
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
  }, [priceData, darkMode, timeRange]);

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
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