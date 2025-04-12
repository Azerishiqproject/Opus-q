'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MiniChartProps {
  coinId: string;
  isPositive?: boolean;
  width?: number;
  height?: number;
}

// Cache with a 20 minute validity
const CACHE_DURATION = 20 * 60 * 1000;
const priceCache: Record<string, { data: number[], timestamp: number }> = {};

// Rate limiting management
let hasRateLimitError = false;
let rateLimitResetTime = 0;

// Request queue management
const requestQueue: (() => void)[] = [];
let isProcessingQueue = false;

// Process requests with delay to avoid rate limits
function processQueue() {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  const request = requestQueue.shift();
  
  if (request) {
    request();
    // Wait 1 second between requests to avoid rate limits
    setTimeout(processQueue, 1000);
  }
}

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

// MiniChart component
const MiniChart: React.FC<MiniChartProps> = ({
  coinId,
  isPositive = true,
  width = 120,
  height = 30,
}) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const requestedRef = useRef(false);
  const currentCoinIdRef = useRef(coinId);
  
  // Generate some demo data to show immediately
  useEffect(() => {
    // Reset the request flag when coin changes
    if (currentCoinIdRef.current !== coinId) {
      requestedRef.current = false;
      currentCoinIdRef.current = coinId;
    }
    
    // Always generate demo data for immediate display
    const demoData = getDemoData(isPositive);
    setChartData(demoData);
    setIsLoadingData(false);
  }, [coinId, isPositive]);
  
  // Then try to fetch real data if possible
  useEffect(() => {
    // If coinId is undefined or invalid, just keep using demo data
    if (!coinId || coinId === 'undefined') {
      console.log(`Invalid coinId for MiniChart: ${coinId}`);
      return;
    }
    
    // If we're currently rate limited, don't even try to fetch
    if (hasRateLimitError && Date.now() < rateLimitResetTime) {
      console.log(`Rate limited, using demo data for ${coinId}`);
      return;
    }
    
    const cacheKey = `${coinId}_1d`;
    const cachedData = priceCache[cacheKey];
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      // Use cached data
      console.log(`Using cached data for ${coinId}`);
      setChartData(cachedData.data);
      return;
    }
    
    // Queue the fetch if not already requested
    if (!requestedRef.current) {
      requestedRef.current = true;
      
      const fetchRequest = () => {
        // Construct API URL carefully
        const apiUrl = `/api/coingecko/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=1`;
        console.log(`Fetching chart data for ${coinId} from: ${apiUrl}`);
        
        // Fetch from API proxy
        fetch(apiUrl)
          .then(response => {
            if (response.status === 429) {
              // Set rate limit flag
              hasRateLimitError = true;
              // Reset after 1 hour if no header info
              const resetAfter = response.headers.get('Retry-After') 
                ? parseInt(response.headers.get('Retry-After') || '3600') * 1000 
                : 3600 * 1000;
              rateLimitResetTime = Date.now() + resetAfter;
              console.warn(`Rate limit exceeded for ${coinId}, retry after ${resetAfter}ms`);
              throw new Error('Rate limit exceeded');
            }
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data && data.prices && Array.isArray(data.prices)) {
              const prices = data.prices.map((item: [number, number]) => item[1]);
              
              if (prices.length > 0) {
                console.log(`Successfully fetched ${prices.length} data points for ${coinId}`);
                
                // Update the cache
                priceCache[cacheKey] = {
                  data: prices,
                  timestamp: Date.now()
                };
                
                // Only update if this is still the current coin
                if (currentCoinIdRef.current === coinId) {
                  setChartData(prices);
                }
              } else {
                console.warn(`Received empty price data for ${coinId}`);
                throw new Error('Empty price data');
              }
            } else {
              console.warn(`Invalid data format for ${coinId}:`, data);
              throw new Error('Invalid data format');
            }
          })
          .catch(error => {
            console.error(`Error fetching data for ${coinId}:`, error);
            // Keep using demo data on error, already set
          });
      };
      
      requestQueue.push(fetchRequest);
      
      if (!isProcessingQueue) {
        processQueue();
      }
    }
    
    // Clean up function
    return () => {
      // Don't reset requestedRef here, as it would cause duplicate requests
    };
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