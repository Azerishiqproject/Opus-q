'use client';

import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiBinance, SiSolana } from 'react-icons/si';
import { HiSearch, HiBell } from 'react-icons/hi';
import dynamic from 'next/dynamic';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSelectedTimeRange, 
  selectSelectedTimeRange,
  setSelectedCoin,
  selectSelectedCoin
} from '@/redux/features/cryptoSlice';
import { fetchUserPortfolio } from '@/redux/slices/portfolioSlice';
import { RootState, AppDispatch } from '@/redux/store';
import MiniChart from '@/components/MiniChart';
import { useState, useRef, useEffect } from 'react';

// Dynamic import of chart component with SSR disabled
const CryptoChart = dynamic(() => import('@/components/CryptoChart'), { ssr: false });

// Coin ikonlarını seçmek için yardımcı fonksiyon
const getCoinIcon = (symbol: string) => {
  const iconSize = 20;
  switch (symbol.toLowerCase()) {
    case 'btc':
      return <FaBitcoin size={iconSize} className="text-white" />;
    case 'eth':
      return <FaEthereum size={iconSize} className="text-white" />;
    case 'ltc':
      return <SiLitecoin size={iconSize} className="text-white" />;
    case 'sol':
      return <SiSolana size={iconSize} className="text-white" />;
    case 'bnb':
      return <SiBinance size={iconSize} className="text-white" />;
    default:
      return null;
  }
};

// Arkaplan renkleri için yardımcı fonksiyon
const getCoinBgColor = (symbol: string) => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return "#f7931a";
    case 'eth':
      return "#627eea";
    case 'ltc':
      return "#bfbbbb";
    case 'sol':
      return "#14f195";
    case 'bnb':
      return "#f3ba2f";
    default:
      return "#6f7cf2"; // Varsayılan renk
  }
};

export default function Dashboard() {
  // Redux state kullanımı
  const dispatch = useDispatch<AppDispatch>();
  const selectedTimeRange = useSelector(selectSelectedTimeRange);
  const selectedCoin = useSelector(selectSelectedCoin);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get portfolio data from Redux
  const { items: portfolioItems, status: portfolioStatus } = useSelector((state: RootState) => state.portfolio);
  
  // Fetch portfolio data when component mounts
  useEffect(() => {
    dispatch(fetchUserPortfolio());
  }, [dispatch]);
  
  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Zaman aralığı değiştiğinde Redux state'ini güncelleme
  const handleTimeRangeChange = (range: string) => {
    dispatch(setSelectedTimeRange(range));
  };
  
  // Coin değiştiğinde Redux state'ini güncelleme
  const handleCoinChange = (coinId: string) => {
    dispatch(setSelectedCoin(coinId));
    setDropdownOpen(false);
  };
  
  // API'dan verileri çekme
  const { data: coins, error, isLoading } = useGetCoinsQuery();

  // Get the current selected coin object
  const currentCoin = selectedCoin && coins
    ? coins.find(coin => coin.id === selectedCoin) 
    : coins && coins.length > 0 
      ? coins[0] 
      : null;
  
  return (
    <div className="min-h-screen bg-[#21232d]">
      {/* Header */}
      <header className="bg-[#21232d] p-5 flex items-center justify-between border-b border-[#272b3b]">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#272b3b] text-gray-300 rounded-[10px] p-4 py-1.5 pl-10 w-[400px] focus:outline-none text-base"
            />
            <HiSearch className="absolute left-3 top-3 text-gray-500" size={16} />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-[#272b3b] rounded-[10px] relative">
            <HiBell className="text-gray-400" size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-[10px]"></div>
            <div className="text-white">
              <span className="text-base">Wizard Labs</span>
              <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-6 space-y-6">
        {/* Crypto cards */}
        <div className="grid grid-cols-4 gap-6">
          {isLoading ? (
            // Loading state için 4 placeholder card
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-[#121319] rounded-lg p-5 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-2"></div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-10"></div>
                    </div>
                  </div>
                </div>
                <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Hata durumu
            <div className="col-span-4 bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg">
              <p>Kripto para verileri alınırken bir hata oluştu.</p>
            </div>
          ) : (
            // API verileri geldiğinde kartları gösterme
            coins?.slice(0, 4).map((coin, index) => {
              const is24hPositive = coin.price_change_percentage_24h >= 0;
              
              return (
                <div key={index} className="bg-[#121319] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: getCoinBgColor(coin.symbol) }}>
                        {coin.image ? (
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          getCoinIcon(coin.symbol)
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base">{coin.name}</h3>
                        <p className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className={`flex items-center ${is24hPositive ? 'text-green-500' : 'text-red-500'}`}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={is24hPositive ? "M5 0L9.33013 6H0.669873L5 0Z" : "M5 6L0.669873 0H9.33013L5 6Z"} fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-white font-bold text-base mb-2">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex justify-between items-center">
                    <span className={`${is24hPositive ? 'text-green-500' : 'text-red-500'} text-xs font-medium`}>
                      {is24hPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                    <div className="w-24 h-8">
                      <MiniChart 
                        coinId={coin.id}
                        isPositive={is24hPositive} 
                        width={96} 
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Portfolio and Chart */}
        <div className="grid grid-cols-3 gap-6">
          {/* My Portfolio Section */}
          <div className="bg-[#121319] rounded-lg p-6 col-span-1">
            <h2 className="text-white font-bold text-base mb-4">My Portfolio</h2>
            
            {/* Portfolio items */}
            <div className="space-y-4">
              {isLoading || portfolioStatus === 'loading' ? (
                // Loading state için placeholder items
                [...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-3 bg-gray-700 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : portfolioStatus === 'failed' ? (
                // Portfolio hata durumu
                <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg">
                  <p>Portföy verileri alınırken bir hata oluştu.</p>
                </div>
              ) : portfolioItems.length === 0 ? (
                // Boş portfolio durumu
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#272b3b]">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-2">Portföyünüzde coin bulunamadı</p>
                  <p className="text-xs text-gray-500">Coin eklemek için Portfolio bölümünü kullanın</p>
                </div>
              ) : (
                // Firestore/Redux'dan gelen portfolio verilerini gösterme
                portfolioItems.map((item, index) => {
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: item.bgColor || getCoinBgColor(item.symbol) }}>
                          {item.symbol ? (
                            <span className="text-white font-bold">{item.symbol.toUpperCase().substring(0, 1)}</span>
                          ) : (
                            getCoinIcon(item.symbol)
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base">{item.name}</h3>
                          <p className="text-gray-400 text-xs">
                            {item.price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={item.isPositive ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                          {item.isPositive ? '+' : '-'}{item.percentChange}
                        </p>
                        <p className="text-white text-xs">{item.amount} {item.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="bg-[#121319] rounded-lg p-6 col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-white font-bold text-2xl">Chart</h2>
              </div>
              
              <div className="flex space-x-2">
                {/* Chart Settings Button */}
                <button className="p-2 bg-[#272b3b] rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
                
                {/* Coin Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center bg-[#272b3b] px-3 py-2 rounded-lg cursor-pointer"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {currentCoin ? (
                      <>
                        <div className="mr-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: getCoinBgColor(currentCoin.symbol) }}>
                            {currentCoin.image ? (
                              <Image
                                src={currentCoin.image}
                                alt={currentCoin.name}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                            ) : (
                              getCoinIcon(currentCoin.symbol)
                            )}
                          </div>
                        </div>
                        <span className="text-white mr-1">{currentCoin.symbol.toUpperCase()}</span>
                      </>
                    ) : (
                      <>
                        <div className="mr-2">
                          <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white">$</span>
                        </div>
                        <span className="text-white mr-1">USD</span>
                      </>
                    )}
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && coins && (
                    <div className="absolute z-10 mt-1 right-0 bg-[#272b3b] rounded-lg shadow-lg max-h-60 overflow-y-auto w-48">
                      {coins.map((coin) => (
                        <div 
                          key={coin.id} 
                          className="flex items-center px-4 py-2 hover:bg-[#1d202f] cursor-pointer"
                          onClick={() => handleCoinChange(coin.id)}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: getCoinBgColor(coin.symbol) }}>
                            {coin.image ? (
                              <Image
                                src={coin.image}
                                alt={coin.name}
                                width={12}
                                height={12}
                                className="rounded-full"
                              />
                            ) : (
                              getCoinIcon(coin.symbol)
                            )}
                          </div>
                          <span className="text-white text-sm">{coin.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[380px] relative">
              {!isLoading && coins && coins.length > 0 ? (
                <CryptoChart 
                  symbol={currentCoin?.id || "bitcoin"} 
                  timeRange={selectedTimeRange} 
                  darkMode={true}
                  priority={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            
            {/* Time Range Buttons */}
            <div className="flex justify-center mt-4">
              <div className="flex bg-[#272b3b] rounded-lg">
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${selectedTimeRange === '1h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  onClick={() => handleTimeRangeChange('1h')}
                >
                  1h
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${selectedTimeRange === '3h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  onClick={() => handleTimeRangeChange('3h')}
                >
                  3h
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${selectedTimeRange === '1d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  onClick={() => handleTimeRangeChange('1d')}
                >
                  1d
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${selectedTimeRange === '1w' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  onClick={() => handleTimeRangeChange('1w')}
                >
                  1w
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm ${selectedTimeRange === '1m' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  onClick={() => handleTimeRangeChange('1m')}
                >
                  1m
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
