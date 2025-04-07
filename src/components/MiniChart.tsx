'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MiniChartProps {
  coinId: string;
  isPositive?: boolean;
  width?: number;
  height?: number;
}

// Global cache for storing price data to reduce API calls
const priceCache: Record<string, {
  data: number[],
  timestamp: number
}> = {};

// Cache validity duration in milliseconds (20 minutes to reduce API calls)
const CACHE_DURATION = 20 * 60 * 1000;

// Queue for API requests to avoid rate limiting
const requestQueue: (() => void)[] = [];
let isProcessingQueue = false;
let hasRateLimitError = false;
let rateLimitResetTime = 0;

// Fallback demo data for charts
const getDemoData = (isPositive: boolean): number[] => {
  const baseValue = 100;
  const volatility = baseValue * 0.05;
  return Array.from({ length: 24 }, (_, i) => {
    const trend = isPositive ? 1 : -1;
    const randomChange = (Math.random() - 0.5) * volatility;
    return baseValue + randomChange + (trend * volatility * (i / 24));
  });
};

// Process requests with delay to prevent rate limiting
const processQueue = () => {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  // If we hit a rate limit, wait until reset time before trying more requests
  if (hasRateLimitError && Date.now() < rateLimitResetTime) {
    // Check again in 10 seconds
    setTimeout(() => {
      processQueue();
    }, 10000);
    return;
  }

  isProcessingQueue = true;
  const request = requestQueue.shift();
  
  if (request) {
    request();
    // Wait 3 seconds between requests to avoid rate limiting
    setTimeout(() => {
      processQueue();
    }, 3000);
  }
};

const MiniChart: React.FC<MiniChartProps> = ({
  coinId,
  isPositive = true,
  width = 80,
  height = 30,
}) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const requestedRef = useRef(false);
  
  // Always show demo data immediately to avoid blank charts
  useEffect(() => {
    setChartData(getDemoData(isPositive)); 
    setIsLoadingData(false);
  }, [isPositive]);
  
  // Then try to fetch real data if possible
  useEffect(() => {
    // Reset request flag when coin changes
    requestedRef.current = false;
    
    // If coinId is undefined or invalid, just keep using demo data
    if (!coinId || coinId === 'undefined') {
      return;
    }
    
    // If we're currently rate limited, don't even try to fetch
    if (hasRateLimitError && Date.now() < rateLimitResetTime) {
      return;
    }
    
    const cacheKey = `${coinId}_1d`;
    const cachedData = priceCache[cacheKey];
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      // Use cached data
      setChartData(cachedData.data);
    } else {
      // Queue the fetch if not already requested
      if (!requestedRef.current) {
        requestedRef.current = true;
        
        const fetchRequest = () => {
          // Fetch from API proxy
          fetch(`/api/coingecko/coins/${coinId}/market_chart?vs_currency=usd&days=1`)
            .then(response => {
              if (response.status === 429) {
                // Set rate limit flag
                hasRateLimitError = true;
                // Reset after 1 hour if no header info
                const resetAfter = response.headers.get('Retry-After') 
                  ? parseInt(response.headers.get('Retry-After') || '3600') * 1000 
                  : 3600 * 1000;
                rateLimitResetTime = Date.now() + resetAfter;
                throw new Error('Rate limit exceeded');
              }
              
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data && data.prices) {
                const prices = data.prices.map((item: [number, number]) => item[1]);
                
                // Update the cache
                priceCache[cacheKey] = {
                  data: prices,
                  timestamp: Date.now()
                };
                
                setChartData(prices);
              }
            })
            .catch(error => {
              console.error(`Error fetching data for ${coinId}:`, error);
              
              // Already using demo data, no need to set again
            });
        };
        
        requestQueue.push(fetchRequest);
        
        if (!isProcessingQueue) {
          processQueue();
        }
      }
    }
  }, [coinId, isPositive]);
  
  // Veri yoksa veya yükleniyor ise düz çizgi göster
  if (isLoadingData || !chartData || chartData.length < 2) {
    return (
      <svg width={width} height={height} className="w-full h-full">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
        />
      </svg>
    );
  }

  // Min ve max değerleri bul
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const range = max - min || 1; // 0'a bölmeyi engellemek için

  // Path için points dizisi oluştur
  const points = chartData.map((value, index) => {
    const x = (index / (chartData.length - 1)) * width;
    // Y eksenini tersine çevir (SVG'de yukarı 0'dır)
    const normalizedValue = (value - min) / range;
    const y = height - normalizedValue * height * 0.9; // Height'ın %90'ını kullan
    return `${x},${y}`;
  });

  // Path oluştur
  const linePath = `M ${points.join(" L ")}`;

  // Area path oluştur (alanı doldurmak için)
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Alan doldurma */}
        <path
          d={areaPath}
          fill={isPositive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}
          stroke="none"
        />

        {/* Çizgi */}
        <path
          d={linePath}
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MiniChart; 