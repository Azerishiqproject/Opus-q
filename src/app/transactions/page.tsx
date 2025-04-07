'use client';

import { useState, useEffect, useRef } from 'react';
import { HiBell } from 'react-icons/hi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiSolana, SiBinance, SiRipple, SiCardano, SiPolkadot } from 'react-icons/si';
import {  RiArrowUpDownLine } from 'react-icons/ri';
import { IoIosArrowDown } from 'react-icons/io';
import { FaWallet } from 'react-icons/fa6';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import { IconType } from 'react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPortfolio } from '@/redux/slices/portfolioSlice';
import { RootState, AppDispatch } from '@/redux/store';

// Define interfaces for our data structures
interface CoinData {
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}


interface AllocationItem {
  coin: string;
  symbol: string;
  icon: IconType | React.ReactNode;
  bgColor: string;
  inOrder: string;
  price: string;
  price2: string;
  holdings: string;
  total: string;
  total2: string;
  profit: string;
  profitPercent: string;
  trend: 'up' | 'down';
}

interface TransactionItem {
  coin: string;
  symbol: string;
  icon: IconType | React.ReactNode;
  bgColor: string;
  availableBalance: string;
  locked: string;
  amount: string;
}

// Video Loading Overlay Component
const VideoLoadingOverlay = ({ isVisible, onFinished }: { isVisible: boolean, onFinished: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play();
      
      // Optional: Add an event listener to handle when the video ends
      videoRef.current.onended = () => {
        onFinished();
      };
      
      // If you want to keep the loading animation for a minimum time even if video is short
      // const timer = setTimeout(onFinished, 2000);
      // return () => clearTimeout(timer);
    }
  }, [isVisible, onFinished]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#1F2431] bg-opacity-90">
      <div className="relative w-64 h-64">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/0407(1).mov" 
          muted 
          playsInline
        />
      </div>
    </div>
  );
};

// Coin icon helper fonksiyonu
const getCoinIcon = (symbol: string): IconType | React.ReactNode => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return FaBitcoin;
    case 'eth':
      return FaEthereum;
    case 'ltc':
      return SiLitecoin;
    case 'xrp':
      return SiRipple;
    case 'bnb':
      return SiBinance;
    case 'sol':
      return SiSolana;
    case 'ada':
      return SiCardano;
    case 'dot':
      return SiPolkadot;
    default:
      // Give the component a name instead of using an anonymous function
      const DefaultCoinIcon = () => <span className="text-white font-bold">{symbol.charAt(0).toUpperCase()}</span>;
      DefaultCoinIcon.displayName = `DefaultCoinIcon-${symbol}`;
      return DefaultCoinIcon;
  }
};

// Coin rengi helper fonksiyonu
const getCoinColor = (symbol: string): string => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return "#f7931a";
    case 'eth':
      return "#627eea";
    case 'ltc':
      return "#bfbbbb";
    case 'xrp':
      return "#0085c0";
    case 'bnb':
      return "#f3ba2f";
    case 'sol':
      return "#14f195";
    case 'ada':
      return "#0033ad";
    case 'dot':
      return "#e6007a";
    default:
      return "#" + Math.floor(Math.random() * 16777215).toString(16); // Rastgele renk
  }
};

const Transactions = () => {
  
  // Redux state and dispatch
  const dispatch = useDispatch<AppDispatch>();
  const { items: portfolioItems, status: portfolioStatus, error: portfolioError } = useSelector((state: RootState) => state.portfolio);
  
  // Coin Allocation state'leri
  const [allocationMonth, setAllocationMonth] = useState('Month');
  const [showAllocationMonthDropdown, setShowAllocationMonthDropdown] = useState(false);
  const [allocationPage, setAllocationPage] = useState(1);
  const [allocationTotalPages, setAllocationTotalPages] = useState(6);
  
  // Transaction History state'leri
  const [historyMonth, setHistoryMonth] = useState('Month');
  const [showHistoryMonthDropdown, setShowHistoryMonthDropdown] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(4);
  
  const [selectedWalletTab, setSelectedWalletTab] = useState('wallet');
  const [exchangeCoin, setExchangeCoin] = useState({
    from: { symbol: 'BTC', amount: '1.0' },
    to: { symbol: 'USD', amount: '40,455.25' }
  });
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [activeExchangeTab, setActiveExchangeTab] = useState('exchange');
  const [isExchangeLoading, setIsExchangeLoading] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  
  // Buy/Sell Coin states
  const [tradeType, setTradeType] = useState('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'TRY'];
  const cryptos = ['BTC', 'ETH', 'LTC', 'XRP', 'BNB', 'SOL', 'ADA', 'DOT'];
  
  // API'dan verileri çekme
  const { data: coins, error, isLoading } = useGetCoinsQuery();
  
  // Dinamik coin allocation ve transaction history verilerini tutacak state'ler
  const [coinAllocationData, setCoinAllocationData] = useState<AllocationItem[]>([]);
  const [transactionHistoryData, setTransactionHistoryData] = useState<TransactionItem[]>([]);
  
  // Fetch portfolio data when component mounts
  useEffect(() => {
    dispatch(fetchUserPortfolio());
  }, [dispatch]);
  
  // Replace the portfolioItems state setting with useEffect that depends on the coins
  useEffect(() => {
    if (coins && coins.length > 0) {
      // We no longer need to set portfolio items as they're coming from Redux
      // Existing code for allocation and history data remains the same
      
      // Sayfa sayısını hesapla
      // Her sayfada 4 öğe olacak şekilde
      const totalAllocationPages = Math.ceil(coins.length / 4);
      const totalHistoryPages = Math.ceil(coins.length / 4);
      
      setAllocationTotalPages(totalAllocationPages > 0 ? totalAllocationPages : 1);
      setHistoryTotalPages(totalHistoryPages > 0 ? totalHistoryPages : 1);
      
      // İlk yükleme için Allocation verilerini oluştur
      generateAllocationData(coins, allocationMonth, allocationPage);
      
      // İlk yükleme için History verilerini oluştur
      generateHistoryData(coins, historyMonth, historyPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);
  
  
  // Allocation verilerini oluşturan yardımcı fonksiyon
  const generateAllocationData = (coinData: CoinData[], month: string, page: number) => {
    if (!coinData || coinData.length === 0) return;
    
    // Verileri al
    const startIndex = (page - 1) * 4 % coinData.length;
    const monthIndex = months.indexOf(month);
    
    // Her sayfa ve ay için aynı rastgele değerleri oluşturmak üzere seed kullan
    const seed = monthIndex * 10 + page;
    const getRandomNumber = (min: number, max: number, seedOffset: number) => {
      // Deterministik bir şekilde "rastgele" sayı oluştur
      const val = Math.sin(seed + seedOffset) * 10000;
      return min + (Math.abs(val) % (max - min));
    };
    
    const allocations = coinData.slice(startIndex, startIndex + 4).map((coin, idx) => {
      // Ay'a göre deterministik veriler oluştur
      const randomHolding = (getRandomNumber(0.1, 5.1, idx) + (monthIndex !== -1 ? monthIndex / 10 : 0)).toFixed(5);
      const priceChangePercent = coin.price_change_percentage_24h + (monthIndex !== -1 ? (monthIndex - 5) : 0);
      const trend: 'up' | 'down' = priceChangePercent >= 0 ? 'up' : 'down';
      
      return {
        coin: coin.name,
        symbol: coin.symbol.toUpperCase(),
        icon: getCoinIcon(coin.symbol),
        bgColor: getCoinColor(coin.symbol),
        inOrder: "0",
        price: `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        price2: `$${(coin.current_price * 0.98).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        holdings: randomHolding,
        total: `$${(parseFloat(randomHolding) * coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total2: `$${(parseFloat(randomHolding) * coin.current_price * 0.98).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        profit: `$${(parseFloat(randomHolding) * coin.current_price * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        profitPercent: `${trend === 'up' ? '+' : ''}${priceChangePercent.toFixed(2)}%`,
        trend
      };
    });
    
    setCoinAllocationData(allocations);
  };
  
  // History verilerini oluşturan yardımcı fonksiyon
  const generateHistoryData = (coinData: CoinData[], month: string, page: number) => {
    if (!coinData || coinData.length === 0) return;
    
    const historyStartIndex = (page - 1) * 4 % coinData.length;
    const adjustedIndex = (historyStartIndex + 4) % coinData.length;
    const historyMonthIndex = months.indexOf(month);
    
    // Deterministic seed oluştur
    const seed = historyMonthIndex * 10 + page;
    const getRandomNumber = (min: number, max: number, seedOffset: number) => {
      const val = Math.cos(seed + seedOffset) * 10000;
      return min + (Math.abs(val) % (max - min));
    };
    
    const transactions = coinData.slice(adjustedIndex, adjustedIndex + 4).map((coin, idx) => {
      const randomMultiplier = historyMonthIndex !== -1 ? 
        (1 + (historyMonthIndex / 10)) : 1;
      
      // Deterministic değerler oluştur
      const availableBalance = getRandomNumber(0.1, 5.1, idx) * coin.current_price * randomMultiplier;
      const locked = coin.current_price * 0.05 * randomMultiplier;
      const amount = getRandomNumber(0.2, 5.2, idx + 100) * coin.current_price * randomMultiplier;
        
      return {
        coin: coin.name,
        symbol: coin.symbol.toUpperCase(),
        icon: getCoinIcon(coin.symbol),
        bgColor: getCoinColor(coin.symbol),
        availableBalance: `$${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        locked: `$${locked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        amount: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      };
    });
    
    setTransactionHistoryData(transactions);
  };
  
  // Allocation değişikliklerini izle
  useEffect(() => {
    if (coins && coins.length > 0) {
      generateAllocationData(coins, allocationMonth, allocationPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationMonth, allocationPage]);
  
  // History değişikliklerini izle
  useEffect(() => {
    if (coins && coins.length > 0) {
      generateHistoryData(coins, historyMonth, historyPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyMonth, historyPage]);

  // Allocation bölümü için handler fonksiyonları
  const handleAllocationMonthSelect = (month: string) => {
    setAllocationMonth(month);
    setShowAllocationMonthDropdown(false);
  };

  const handleAllocationPageChange = (page: number) => {
    if (page >= 1 && page <= allocationTotalPages) {
      setAllocationPage(page);
    }
  };

  // History bölümü için handler fonksiyonları
  const handleHistoryMonthSelect = (month: string) => {
    setHistoryMonth(month);
    setShowHistoryMonthDropdown(false);
  };

  const handleHistoryPageChange = (page: number) => {
    if (page >= 1 && page <= historyTotalPages) {
      setHistoryPage(page);
    }
  };

  // Yeni handler fonksiyonları
  const handleExchangeCoinSelect = (crypto: string) => {
    setExchangeCoin(prev => ({
      ...prev,
      from: { ...prev.from, symbol: crypto }
    }));
    setShowCryptoDropdown(false);
    
    // Seçilen kripto para birimine göre değeri güncelle
    if (coins) {
      const selectedCoin = coins.find(coin => coin.symbol.toUpperCase() === crypto);
      if (selectedCoin) {
        const newAmount = '1.0';
        const newValue = (selectedCoin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        setExchangeCoin({
          from: { symbol: crypto, amount: newAmount },
          to: { symbol: 'USD', amount: newValue }
        });
      }
    }
  };

  const handleCurrencySelect = (currency: string) => {
    setExchangeCoin(prev => ({
      ...prev,
      to: { ...prev.to, symbol: currency }
    }));
    setShowCurrencyDropdown(false);
  };

  const handleSwapCurrencies = () => {
    setExchangeCoin(prev => ({
      from: { ...prev.to, amount: prev.to.amount },
      to: { ...prev.from, amount: prev.from.amount }
    }));
  };

  const handleExchange = () => {
    console.log(`Exchanging ${exchangeCoin.from.amount} ${exchangeCoin.from.symbol} to ${exchangeCoin.to.symbol}`);
    
    // Show loading state and video overlay
    setIsExchangeLoading(true);
    setShowVideoOverlay(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsExchangeLoading(false);
      // Don't hide video overlay here, let the video finish or manual close
      alert(`Exchange successful: ${exchangeCoin.from.amount} ${exchangeCoin.from.symbol} → ${exchangeCoin.to.amount} ${exchangeCoin.to.symbol}`);
    }, 2000);
  };

  // Handlers for Buy/Sell functionality
  const handleTradeTypeChange = (type: 'buy' | 'sell') => {
    setTradeType(type);
  };

  const handleCoinSelect = (coin: string) => {
    setSelectedCoin(coin);
    setShowTradeDropdown(false);
  };

  const handleTradeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and one decimal point
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setTradeAmount(value);
    }
  };

  const handleTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Show loading state and video overlay
    setIsExchangeLoading(true);
    setShowVideoOverlay(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsExchangeLoading(false);
      // Don't hide video overlay here, let the video finish or manual close
      
      // Get current price from coins data
      const coinData = coins?.find(coin => coin.symbol.toUpperCase() === selectedCoin);
      const price = coinData?.current_price || 0;
      const total = (parseFloat(tradeAmount) * price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      alert(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${selectedCoin} for $${total}`);
      setTradeAmount('');
    }, 2000);
  };

  // Handler for when video finishes
  const handleVideoFinished = () => {
    setShowVideoOverlay(false);
  };

  // Get coin price in USD
  const getCoinPrice = (symbol: string) => {
    const coin = coins?.find(c => c.symbol.toUpperCase() === symbol);
    return coin ? coin.current_price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) : '0.00';
  };

  // Get coin icon color
  const getCoinIconForExchange = (symbol: string) => {
    switch(symbol.toUpperCase()) {
      case 'BTC':
        return <FaBitcoin className="text-white" size={12} />;
      case 'ETH':
        return <FaEthereum className="text-white" size={12} />;
      case 'LTC':
        return <SiLitecoin className="text-white" size={12} />;
      case 'SOL':
        return <SiSolana className="text-white" size={12} />;
      case 'BNB':
        return <SiBinance className="text-white" size={12} />;
      case 'XRP':
        return <SiRipple className="text-white" size={12} />;
      case 'ADA':
        return <SiCardano className="text-white" size={12} />;
      case 'DOT':
        return <SiPolkadot className="text-white" size={12} />;
      default:
        return <span className="text-white text-xs">{symbol.charAt(0)}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#21232d]">
      {/* Video Overlay */}
      <VideoLoadingOverlay 
        isVisible={showVideoOverlay}
        onFinished={handleVideoFinished}
      />
      
      {/* Header */}
      <header className="bg-[#21232d] p-5 flex items-center justify-between border-b border-[#272b3b]">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#121319] text-gray-300 rounded-xl py-2 pl-10 pr-4 w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm border border-[#272b3b]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
        <div className="flex gap-6">
          <div className="w-2/3 space-y-6">
            {/* Coin Allocation Section */}
            <div className="bg-[#121319] rounded-lg p-5 h-[468px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-lg font-bold">Coin Allocation</h2>
                
                <div className="flex items-center">
                  <div className="relative">
                    <button 
                      className="bg-[#272b3b] h-8 px-3 py-1 rounded-lg text-sm text-white flex items-center"
                      onClick={() => setShowAllocationMonthDropdown(!showAllocationMonthDropdown)}
                    >
                      <span>{allocationMonth}</span>
                      <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {showAllocationMonthDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 w-36">
                        {months.map((month) => (
                          <button
                            key={month}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#31354a] transition-colors"
                            onClick={() => handleAllocationMonthSelect(month)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex ml-3">
                    <button 
                      className="bg-[#272b3b] p-1.5 rounded-l-lg"
                      onClick={() => handleAllocationPageChange(allocationPage - 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="bg-[#272b3b] p-1.5 rounded-r-lg"
                      onClick={() => handleAllocationPageChange(allocationPage + 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Table header */}
              <div className="grid grid-cols-6 gap-4 text-xs text-gray-400 py-2 border-b border-gray-700">
                <div className="flex items-center">Pair / Holdings</div>
                <div className="flex items-center">In Order Qty</div>
                <div className="flex items-center">Price / Avg Buy</div>
                <div className="flex items-center">Holdings Assets</div>
                <div className="flex items-center">Total Asset Value</div>
                <div className="flex items-center">Profit / Loss</div>
                <div></div> {/* Empty column for actions */}
              </div>
              
              {/* Loading state */}
              {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="flex-1 flex items-center justify-center text-red-500">
                  <p>Veri alınırken bir hata oluştu.</p>
                </div>
              )}
              
              {/* Coin rows - Dinamik verilerle */}
              {!isLoading && !error && coinAllocationData.map((coin, index) => {
                const Icon = coin.icon as IconType;
                return (
                  <div key={index} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-800 text-white text-sm">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: coin.bgColor }}>
                        {typeof coin.icon === 'function' ? (
                          <Icon className="text-white" size={16} />
                        ) : (
                          coin.icon
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{coin.coin}</div>
                        <div className="text-xs text-gray-400">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="flex items-center">{coin.inOrder}</div>
                    <div className="flex flex-col">
                      <div>{coin.price}</div>
                      <div className="text-xs text-gray-400">{coin.price2}</div>
                    </div>
                    <div className="flex items-center">{coin.holdings} {coin.symbol}</div>
                    <div className="flex flex-col">
                      <div>{coin.total}</div>
                      <div className="text-xs text-gray-400">{coin.total2}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <div>{coin.profit}</div>
                        <div className={`text-xs ${coin.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.profitPercent}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Pagination - Coin Allocation */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="text-gray-400 text-xs">52 assets</div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`text-gray-400 p-1 hover:text-blue-400 transition-colors ${allocationPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => allocationPage > 1 && handleAllocationPageChange(allocationPage - 1)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className="flex space-x-1">
                    <button 
                      className="bg-blue-600 text-white rounded-sm w-6 h-6 flex items-center justify-center text-xs"
                    >
                      {allocationPage}
                    </button>
                    <span className="text-gray-400 text-xs self-center">/ {allocationTotalPages}</span>
                  </div>
                  
                  <button 
                    className={`text-gray-400 p-1 hover:text-blue-400 transition-colors ${allocationPage === allocationTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => allocationPage < allocationTotalPages && handleAllocationPageChange(allocationPage + 1)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Transaction History Section */}
            <div className="bg-[#121319] rounded-lg p-5 h-[468px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-lg font-bold">Transaction History</h2>
                
                <div className="flex space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by date"
                      className="bg-[#121319] text-gray-300 rounded-xl py-2 pl-10 pr-4 w-[180px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-[#272b3b]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button 
                      className="bg-[#272b3b] h-8 px-3 py-1 rounded-lg text-sm text-white flex items-center"
                      onClick={() => setShowHistoryMonthDropdown(!showHistoryMonthDropdown)}
                    >
                      <span>{historyMonth}</span>
                      <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {showHistoryMonthDropdown && (
                      <div className="absolute top-full right-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 w-36">
                        {months.map((month) => (
                          <button
                            key={month}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#31354a] transition-colors"
                            onClick={() => handleHistoryMonthSelect(month)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex text-sm mb-4 border-b border-gray-700">
                <button 
                  className={`mr-6 py-2 ${selectedWalletTab === 'history' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setSelectedWalletTab('history')}
                >
                  Wallet History
                </button>
                <button 
                  className={`mr-6 py-2 ${selectedWalletTab === 'wallet' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setSelectedWalletTab('wallet')}
                >
                  Coin Wallet
                </button>
              </div>
              
              {/* Table header */}
              <div className="grid grid-cols-6 gap-4 text-xs text-gray-400 py-2 border-b border-gray-700">
                <div className="flex items-center">Pair</div>
                <div className="flex items-center">Avbl. Balance</div>
                <div className="flex items-center">Locked</div>
                <div className="flex items-center">Amount</div>
                <div className="flex items-center">Action</div>
                <div></div> {/* Empty column for actions */}
              </div>
              
              {/* İçeriği dinamik verilerle yenile */}
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center text-red-500">
                  <p>İşlem geçmişi alınırken bir hata oluştu.</p>
                </div>
              ) : (
                // Dinamik verilerle transaction history
                <div className="mt-4 flex-1 overflow-auto">
                  {transactionHistoryData.map((item, index) => {
                    const Icon = item.icon as IconType;
                    return (
                      <div key={index} className="flex justify-between items-center p-3 border-b border-gray-800">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: item.bgColor }}>
                            {typeof item.icon === 'function' ? (
                              <Icon className="text-white" size={16} />
                            ) : (
                              item.icon
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium">{item.coin}</div>
                            <div className="text-xs text-gray-400">{item.symbol}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-1 justify-center">
                          <div className="text-gray-400 text-sm">{item.availableBalance}</div>
                        </div>
                        
                        <div className="flex flex-1 justify-center">
                          <div className="text-gray-400 text-sm">{item.locked}</div>
                        </div>
                        
                        <div className="flex flex-1 justify-end">
                          <div className="text-white text-sm font-medium">{item.amount}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Pagination - Transaction History */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="text-gray-400 text-xs">48 transactions</div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`text-gray-400 p-1 hover:text-blue-400 transition-colors ${historyPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => historyPage > 1 && handleHistoryPageChange(historyPage - 1)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className="flex space-x-1">
                    <button 
                      className="bg-blue-600 text-white rounded-sm w-6 h-6 flex items-center justify-center text-xs"
                    >
                      {historyPage}
                    </button>
                    <span className="text-gray-400 text-xs self-center">/ {historyTotalPages}</span>
                  </div>
                  
                  <button 
                    className={`text-gray-400 p-1 hover:text-blue-400 transition-colors ${historyPage === historyTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => historyPage < historyTotalPages && handleHistoryPageChange(historyPage + 1)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 space-y-6">
            {/* Exchange Coin */}
            <div className="bg-[#121319] rounded-lg p-5 h-[468px] flex flex-col">
              {/* Exchange Coin Tabs */}
              <div className="flex text-sm mb-5 border-b border-gray-700">
                <button 
                  className={`mr-6 py-2 ${activeExchangeTab === 'exchange' 
                    ? 'text-blue-500 border-b-2 border-blue-500 font-medium' 
                    : 'text-gray-400'}`}
                  onClick={() => setActiveExchangeTab('exchange')}
                >
                  Exchange Coin
                </button>
                <button 
                  className={`mr-6 py-2 ${activeExchangeTab === 'trade' 
                    ? 'text-blue-500 border-b-2 border-blue-500 font-medium' 
                    : 'text-gray-400'}`}
                  onClick={() => setActiveExchangeTab('trade')}
                >
                  Buy / Sell Coin
                </button>
              </div>
              
              {/* Exchange or Buy/Sell Form based on active tab */}
              {activeExchangeTab === 'exchange' ? (
                <div className="space-y-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-600 flex items-center justify-center rounded-full mr-3">
                        <FaWallet className="text-white" size={16} />
                      </div>
                      <span className="text-white text-xs">$38,447.54</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                        <FaBitcoin className="text-white" size={16} />
                      </div>
                      <span className="text-white text-xs">$38,447.54</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#272b3b] rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center flex-col">
                          <div className="text-gray-400 text-xs">Coin</div>
                          <div className="text-white text-sm">{exchangeCoin.from.amount}</div>
                      </div>
                      <div className="relative">
                        <button 
                          className="flex items-center" 
                          onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                        >
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                            {getCoinIconForExchange(exchangeCoin.from.symbol)}
                          </div>
                          <span className="text-white text-sm mr-1">{exchangeCoin.from.symbol}</span>
                          <IoIosArrowDown className="text-white" size={16} />
                        </button>
                        
                        {showCryptoDropdown && (
                          <div className="absolute top-full right-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 w-32">
                            {cryptos.map((crypto) => (
                              <button
                                key={crypto}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#31354a] transition-colors flex items-center"
                                onClick={() => handleExchangeCoinSelect(crypto)}
                              >
                                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mr-2">
                                  {getCoinIconForExchange(crypto)}
                                </div>
                                {crypto}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      className="bg-[#272b3b] p-2 rounded-full hover:bg-[#31354a] transition-colors"
                      onClick={handleSwapCurrencies}
                    >
                      <RiArrowUpDownLine className="text-white" size={20} />
                    </button>
                  </div>
                  
                  <div className="bg-[#272b3b] rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-left flex-col">
                          <div className="text-gray-400 text-xs">Change</div>
                          <div className="text-white text-sm ml-1">${exchangeCoin.to.amount}</div>
                      </div>
                      <div className="relative">
                        <button 
                          className="flex items-center"
                          onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                            <FaWallet className="text-white" size={12} />
                          </div>
                          <span className="text-white text-sm mr-1">{exchangeCoin.to.symbol}</span>
                          <IoIosArrowDown className="text-white" size={16} />
                        </button>
                        
                        {showCurrencyDropdown && (
                          <div className="absolute top-full right-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 w-32">
                            {currencies.map((currency) => (
                              <button
                                key={currency}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#31354a] transition-colors"
                                onClick={() => handleCurrencySelect(currency)}
                              >
                                {currency}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <div className="text-gray-400 text-xs">No extra fees:</div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <button 
                      className={`w-full ${isExchangeLoading ? 'bg-blue-800' : 'bg-blue-600'} text-white font-medium rounded-lg py-3 text-sm hover:bg-blue-700 transition-colors relative`}
                      onClick={handleExchange}
                      disabled={isExchangeLoading}
                    >
                      {isExchangeLoading ? (
                        <>
                          <span className="opacity-0">Exchange</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          </div>
                        </>
                      ) : 'Exchange'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Buy/Sell Form */
                <div className="space-y-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-600 flex items-center justify-center rounded-full mr-3">
                        <FaWallet className="text-white" size={16} />
                      </div>
                      <span className="text-white text-xs">$38,447.54</span>
                    </div>
                  </div>
                  
                  {/* Trade Type Toggle */}
                  <div className="bg-[#272b3b] rounded-lg p-1 flex">
                    <button 
                      className={`flex-1 py-2 rounded-lg text-center text-sm ${tradeType === 'buy' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                      onClick={() => handleTradeTypeChange('buy')}
                    >
                      Buy
                    </button>
                    <button 
                      className={`flex-1 py-2 rounded-lg text-center text-sm ${tradeType === 'sell' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
                      onClick={() => handleTradeTypeChange('sell')}
                    >
                      Sell
                    </button>
                  </div>
                  
                  {/* Coin Selector */}
                  <div className="bg-[#272b3b] rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Coin</span>
                      <div className="relative">
                        <button 
                          className="flex items-center" 
                          onClick={() => setShowTradeDropdown(!showTradeDropdown)}
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: getCoinColor(selectedCoin.toLowerCase()) }}>
                            {getCoinIconForExchange(selectedCoin)}
                          </div>
                          <span className="text-white text-sm mr-1">{selectedCoin}</span>
                          <IoIosArrowDown className="text-white" size={16} />
                        </button>
                        
                        {showTradeDropdown && (
                          <div className="absolute top-full right-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 w-32 max-h-48 overflow-y-auto">
                            {cryptos.map((crypto) => (
                              <button
                                key={crypto}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#31354a] transition-colors flex items-center"
                                onClick={() => handleCoinSelect(crypto)}
                              >
                                <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: getCoinColor(crypto.toLowerCase()) }}>
                                  {getCoinIconForExchange(crypto)}
                                </div>
                                {crypto}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Price */}
                  <div className="bg-[#272b3b] rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Current Price</span>
                      <span className="text-white text-sm">${getCoinPrice(selectedCoin)}</span>
                    </div>
                  </div>
                  
                  {/* Amount Input */}
                  <div className="bg-[#272b3b] rounded-lg p-3">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs mb-2">Amount</span>
                      <div className="flex">
                        <input
                          type="text"
                          value={tradeAmount}
                          onChange={handleTradeAmountChange}
                          placeholder="0.00"
                          className="bg-transparent border-none outline-none text-white text-sm flex-1"
                        />
                        <span className="text-gray-400 text-sm">{selectedCoin}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total in USD */}
                  {tradeAmount && (
                    <div className="bg-[#272b3b] rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Total</span>
                        <span className="text-white text-sm">
                          ${(parseFloat(tradeAmount) * (coins?.find(c => c.symbol.toUpperCase() === selectedCoin)?.current_price || 0)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4">
                    <button 
                      className={`w-full ${isExchangeLoading ? 'bg-gray-700' : tradeType === 'buy' ? 'bg-blue-600' : 'bg-red-600'} text-white font-medium rounded-lg py-3 text-sm hover:${tradeType === 'buy' ? 'bg-blue-700' : 'bg-red-700'} transition-colors relative`}
                      onClick={handleTrade}
                      disabled={isExchangeLoading || !tradeAmount}
                    >
                      {isExchangeLoading ? (
                        <>
                          <span className="opacity-0">{tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCoin}</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          </div>
                        </>
                      ) : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* My Portfolio */}
            <div className="bg-[#121319] rounded-lg p-5 h-[468px] flex flex-col">
              <div className="mb-4">
                <h2 className="text-white text-lg font-bold">My Portfolio</h2>
              </div>
              
              {/* Portfolio items */}
              <div className="space-y-4 flex-grow overflow-auto">
                {isLoading || portfolioStatus === 'loading' ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : portfolioStatus === 'failed' ? (
                  <div className="flex-1 flex items-center justify-center text-red-500">
                    <p>Portföy verileri alınırken bir hata oluştu: {portfolioError}</p>
                  </div>
                ) : portfolioItems.length === 0 ? (
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
                  portfolioItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: item.bgColor || getCoinColor(item.symbol) }}>
                          <span className="text-white font-bold">{item.symbol.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-base">{item.name}</h3>
                          <p className="text-gray-400 text-xs">{item.price || '$0.00'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={item.isPositive ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                          {item.isPositive ? '+' : '-'}{item.percentChange || '0.00%'}
                        </p>
                        <p className="text-white text-xs">{item.amount} {item.symbol}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add display name for ESLint rule
Transactions.displayName = 'Transactions';

export default Transactions; 