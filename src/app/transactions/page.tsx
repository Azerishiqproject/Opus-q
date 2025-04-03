'use client';

import { useState, useEffect } from 'react';
import { HiBell } from 'react-icons/hi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiSolana, SiBinance, SiRipple, SiCardano, SiPolkadot } from 'react-icons/si';
import {  RiArrowUpDownLine } from 'react-icons/ri';
import { IoIosArrowDown } from 'react-icons/io';
import { FaWallet } from 'react-icons/fa6';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import { IconType } from 'react-icons';

// Define interfaces for our data structures
interface CoinData {
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface PortfolioItem {
  name: string;
  icon: IconType | React.ReactNode;
  bgColor: string;
  price: string;
  change: string;
  amount: string;
  symbol: string;
  trend: 'up' | 'down';
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
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'TRY'];
  const cryptos = ['BTC', 'ETH', 'LTC', 'XRP', 'BNB', 'SOL', 'ADA', 'DOT'];
  
  // API'dan verileri çekme
  const { data: coins, error, isLoading } = useGetCoinsQuery();
  
  // Dinamik coin allocation ve transaction history verilerini tutacak state'ler
  const [coinAllocationData, setCoinAllocationData] = useState<AllocationItem[]>([]);
  const [transactionHistoryData, setTransactionHistoryData] = useState<TransactionItem[]>([]);
  
  // My Portfolio bölümünü API'den gelen verilerle değiştir
  // Önce state oluştur
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  
  // useEffect içinde portfolio verilerini de oluştur
  useEffect(() => {
    if (coins && coins.length > 0) {
      // Portfolio items verilerini oluştur (sadece bir kez)
      const portfolio = coins.slice(0, 5).map(coin => {
        const randomAmount = (Math.random() * 2 + 0.1).toFixed(4);
        const priceChangePercent = coin.price_change_percentage_24h;
        const trend: 'up' | 'down' = priceChangePercent >= 0 ? 'up' : 'down';
        
        return {
          name: coin.name,
          icon: getCoinIcon(coin.symbol),
          bgColor: getCoinColor(coin.symbol),
          price: `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${trend === 'up' ? '+' : ''}${priceChangePercent.toFixed(2)}%`,
          amount: randomAmount,
          symbol: coin.symbol.toUpperCase(),
          trend
        };
      });
      
      setPortfolioItems(portfolio);
      
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

  const handleExchange = () => {
    // Simple implementation that just logs the exchange
    console.log(`Exchanging ${exchangeCoin.from.amount} ${exchangeCoin.from.symbol} to ${exchangeCoin.to.symbol}`);
    
    // Here you would typically call an API or perform actual exchange logic
    // But for now we'll just show an alert
    alert(`Exchange successful: ${exchangeCoin.from.amount} ${exchangeCoin.from.symbol} → ${exchangeCoin.to.amount} ${exchangeCoin.to.symbol}`);
  };

  const handleSwapCurrencies = () => {
    setExchangeCoin(prev => ({
      from: { ...prev.to, amount: prev.to.amount },
      to: { ...prev.from, amount: prev.from.amount }
    }));
  };

  return (
    <div className="min-h-screen bg-[#21232d]">
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
                  className="mr-6 py-2 text-blue-500 border-b-2 border-blue-500 font-medium"
                >
                  Exchange Coin
                </button>
                <button 
                  className="mr-6 py-2 text-gray-400"
                >
                  Buy / Sell Coin
                </button>
              </div>
              
              {/* Exchange Form */}
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
                          {exchangeCoin.from.symbol === 'BTC' ? (
                            <FaBitcoin className="text-white" size={12} />
                          ) : exchangeCoin.from.symbol === 'ETH' ? (
                            <FaEthereum className="text-white" size={12} />
                          ) : (
                            <span className="text-white text-xs">{exchangeCoin.from.symbol.charAt(0)}</span>
                          )}
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
                                <span className="text-white text-xs">{crypto.charAt(0)}</span>
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
                    className="w-full bg-blue-600 text-white font-medium rounded-lg py-3 text-sm hover:bg-blue-700 transition-colors"
                    onClick={handleExchange}
                  >
                    Exchange
                  </button>
                </div>
              </div>
            </div>
            
            {/* My Portfolio */}
            <div className="bg-[#121319] rounded-lg p-5 h-[468px] flex flex-col">
              <div className="mb-4">
                <h2 className="text-white text-lg font-bold">My Portfolio</h2>
              </div>
              
              {/* Portfolio items */}
              <div className="space-y-4 flex-grow overflow-auto">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex-1 flex items-center justify-center text-red-500">
                    <p>Portföy verileri alınırken bir hata oluştu.</p>
                  </div>
                ) : (
                  portfolioItems.map((item, index) => {
                    const Icon = item.icon as IconType;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: item.bgColor }}>
                            {typeof item.icon === 'function' ? (
                              <Icon className="text-white" size={20} />
                            ) : (
                              item.icon
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-base">{item.name}</h3>
                            <p className="text-gray-400 text-xs">{item.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={item.trend === 'up' ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>{item.change}</p>
                          <p className="text-white text-xs">{item.amount} {item.symbol}</p>
                        </div>
                      </div>
                    );
                  })
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