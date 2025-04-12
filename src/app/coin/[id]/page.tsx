'use client';

import { FaArrowLeft, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useGetCoinByIdQuery } from '@/redux/services/coinApi';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of chart component with SSR disabled
const CryptoChart = dynamic(() => import('@/components/CryptoChart'), { ssr: false });

export default function CoinDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Safely access the id parameter, handling both current and future Next.js versions
  const coinId = params instanceof Promise ? React.use(params).id : params.id;
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('1d');
  
  // Fetch coin details
  const { data: coin, isLoading, error } = useGetCoinByIdQuery(coinId);
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  const goBack = () => {
    router.back();
  };
  
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    const isPositive = value >= 0;
    return (
      <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
        {isPositive ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };
  
  // Format large numbers
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(num);
  };
  
  // Format currency
  const formatCurrency = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };
  
  return (
    <div className="min-h-screen bg-[#21232d]">
      <Navbar 
        title="Coin Details" 
        showSearch={true}
      />
      
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg text-center">
            <p>Failed to load coin data.</p>
            <button 
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={goBack}
            >
              Go Back
            </button>
          </div>
        ) : coin ? (
          <>
            {/* Coin Header */}
            <div className="bg-[#121319] rounded-lg p-5">
              <button 
                className="mb-4 flex items-center text-blue-500 hover:underline"
                onClick={goBack}
              >
                <FaArrowLeft className="mr-2" size={14} />
                Back
              </button>
              
              <div className="flex items-center">
                <div className="w-16 h-16 mr-4">
                  {coin.image && (
                    <Image 
                      src={coin.image}
                      alt={coin.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  )}
                </div>
                
                <div>
                  <h1 className="text-white text-2xl font-bold flex items-center">
                    {coin.name}
                    <span className="ml-2 text-gray-400 text-base font-normal">{coin.symbol.toUpperCase()}</span>
                    {coin.market_cap_rank && (
                      <span className="ml-2 bg-[#272b3b] px-2 py-1 rounded text-xs text-gray-400">
                        Rank #{coin.market_cap_rank}
                      </span>
                    )}
                  </h1>
                  
                  <div className="flex items-center mt-2">
                    <span className="text-white text-2xl font-bold mr-3">
                      {formatCurrency(coin.current_price)}
                    </span>
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Price Chart */}
            <div className="bg-[#121319] rounded-lg p-5">
              <h2 className="text-white text-xl font-bold mb-4">Price Chart</h2>
              
              <div className="h-[400px] relative mb-4">
                <CryptoChart 
                  symbol={coin.id} 
                  timeRange={timeRange} 
                  darkMode={true}
                  priority={true}
                />
              </div>
              
              {/* Time Range Buttons */}
              <div className="flex justify-center">
                <div className="flex bg-[#272b3b] rounded-lg">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm ${timeRange === '1h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    onClick={() => handleTimeRangeChange('1h')}
                  >
                    1h
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm ${timeRange === '4h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    onClick={() => handleTimeRangeChange('4h')}
                  >
                    4h
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm ${timeRange === '12h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    onClick={() => handleTimeRangeChange('12h')}
                  >
                    12h
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm ${timeRange === '1d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    onClick={() => handleTimeRangeChange('1d')}
                  >
                    1d
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm ${timeRange === '1w' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    onClick={() => handleTimeRangeChange('1w')}
                  >
                    1w
                  </button>
                </div>
              </div>
            </div>
            
            {/* Market Stats */}
            <div className="bg-[#121319] rounded-lg p-5">
              <h2 className="text-white text-xl font-bold mb-4">Market Stats</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Market Cap</div>
                  <div className="text-white font-bold">{formatCurrency(coin.market_cap)}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">24h Trading Volume</div>
                  <div className="text-white font-bold">{formatCurrency(coin.total_volume)}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Circulating Supply</div>
                  <div className="text-white font-bold">{formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Total Supply</div>
                  <div className="text-white font-bold">{coin.total_supply ? formatNumber(coin.total_supply) + ' ' + coin.symbol.toUpperCase() : 'Unlimited'}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Max Supply</div>
                  <div className="text-white font-bold">{coin.max_supply ? formatNumber(coin.max_supply) + ' ' + coin.symbol.toUpperCase() : 'Unlimited'}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">All Time High</div>
                  <div className="text-white font-bold">{formatCurrency(coin.ath)}</div>
                  <div className="text-xs mt-1">{formatPercentage(coin.ath_change_percentage)} from ATH</div>
                </div>
              </div>
            </div>
            
            {/* Price Change Percentages */}
            <div className="bg-[#121319] rounded-lg p-5">
              <h2 className="text-white text-xl font-bold mb-4">Price Changes</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">1 Hour</div>
                  <div className="text-white font-bold">{formatPercentage(coin.price_change_percentage_1h_in_currency)}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">24 Hours</div>
                  <div className="text-white font-bold">{formatPercentage(coin.price_change_percentage_24h)}</div>
                </div>
                
                <div className="bg-[#272b3b] p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">7 Days</div>
                  <div className="text-white font-bold">{formatPercentage(coin.price_change_percentage_7d_in_currency)}</div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-[#121319] rounded-lg p-5">
              <h2 className="text-white text-xl font-bold mb-4">Actions</h2>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                  onClick={() => router.push(`/transactions?coin=${coin.id}`)}
                >
                  Buy {coin.symbol.toUpperCase()}
                </button>
                
                <button 
                  className="bg-[#272b3b] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#31354a] transition-colors"
                  onClick={() => alert(`Add ${coin.name} to watchlist`)}
                >
                  Add to Watchlist
                </button>
                
                <button 
                  className="bg-[#272b3b] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#31354a] transition-colors"
                  onClick={() => router.push(`/wallet?add=${coin.id}`)}
                >
                  Add to Portfolio
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
} 