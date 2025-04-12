'use client';

import { useState, useEffect} from 'react';
import { FaBitcoin, FaEthereum, FaArrowUp, FaArrowDown, FaExchangeAlt, FaDollarSign, FaWallet } from 'react-icons/fa';
import { SiLitecoin, SiSolana, SiBinance } from 'react-icons/si';
import { IconType } from 'react-icons';
import CoinList from '@/components/CoinList';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPortfolio } from '@/redux/slices/portfolioSlice';
import { AppDispatch, RootState } from '@/redux/store';
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

interface WalletItem {
  name: string;
  symbol: string;
  icon: IconType | ReactNode;
  bgColor: string;
  balance: string;
  fiatValue: string;
  change: string;
  trend: 'up' | 'down';
}

interface TransactionItem {
  type: 'send' | 'receive' | 'swap';
  amount: string;
  coin: string;
  symbol: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  address: string;
  icon: IconType;
  bgColor: string;
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
    case 'sol':
      return SiSolana;
    case 'bnb':
      return SiBinance;
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
    case 'sol':
      return "#14f195";
    case 'bnb':
      return "#f3ba2f";
    default:
      return "#" + Math.floor(Math.random() * 16777215).toString(16); // Rastgele renk
  }
};

// Define static chart data for different currencies
const chartData: {
  [key: string]: {
    values: number[];
    trend: 'up' | 'down';
  }
} = {
  BTC: {
    values: [40, 60, 45, 70, 55, 80, 65, 90, 75, 85, 50, 60],
    trend: 'up'
  },
  ETH: {
    values: [65, 45, 55, 70, 80, 50, 40, 60, 75, 85, 90, 70],
    trend: 'up'
  },
  USD: {
    values: [80, 75, 70, 65, 60, 55, 50, 45, 40, 38, 35, 30],
    trend: 'down'
  }
};

// Static fallback data in case of API failure
const staticPortfolioData = [
  { symbol: 'BTC', balance: '2.31', fiatValue: '$75,183.00', change: '1.2%', trend: 'up' as const },
  { symbol: 'ETH', balance: '15.48', fiatValue: '$31,245.76', change: '0.8%', trend: 'up' as const },
  { symbol: 'SOL', balance: '132.5', fiatValue: '$18,947.50', change: '2.3%', trend: 'down' as const },
  { symbol: 'BNB', balance: '41.32', fiatValue: '$12,354.68', change: '0.5%', trend: 'up' as const },
  { symbol: 'AVAX', balance: '210.45', fiatValue: '$4,893.84', change: '1.1%', trend: 'down' as const },
  { symbol: 'DOT', balance: '562.1', fiatValue: '$3,248.93', change: '0.7%', trend: 'up' as const },
  { symbol: 'ADA', balance: '3125.8', fiatValue: '$2,781.96', change: '1.5%', trend: 'down' as const },
  { symbol: 'MATIC', balance: '4582.6', fiatValue: '$2,382.95', change: '2.1%', trend: 'up' as const },
  { symbol: 'LINK', balance: '187.2', fiatValue: '$2,246.40', change: '0.9%', trend: 'down' as const },
  { symbol: 'DOGE', balance: '12857.4', fiatValue: '$1,157.17', change: '1.8%', trend: 'up' as const }
];

export default function Wallet() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('coins');
  const [activeHistoryTab, setActiveHistoryTab] = useState('all');
  const [activeCurrency, setActiveCurrency] = useState('BTC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // API'dan verileri çekme
  const { data: coins, error: coinError, isLoading: isCoinsLoading } = useGetCoinsQuery();
  
  // Redux portfolio data from Firebase
  const { items: portfolioItems, status: portfolioStatus, error: portfolioError } = 
    useSelector((state: RootState) => state.portfolio);
  
  // Dinamik portföy verileri
  const [dynamicWalletItems, setDynamicWalletItems] = useState<WalletItem[]>([]);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState("$0.00");
  const [totalBalanceChange, setTotalBalanceChange] = useState("0.00%");
  const [totalBalanceChangeAmount, setTotalBalanceChangeAmount] = useState("$0.00");
  const [totalBalanceTrend, setTotalBalanceTrend] = useState<'up' | 'down'>('up');
  const [dataLoadStatus, setDataLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Pagination functionality
  const itemsPerPage = 5;
  const [timePeriod, setTimePeriod] = useState('7 Days');
  
  // Fetch portfolio from Firebase on component mount
  useEffect(() => {
    if (portfolioStatus === 'idle') {
      dispatch(fetchUserPortfolio());
    }
  }, [dispatch, portfolioStatus]);
  
  // Convert portfolio items to wallet items and calculate totals
  useEffect(() => {
    if (isCoinsLoading || portfolioStatus === 'loading') {
      setDataLoadStatus('loading');
      return;
    }
    
    if (coinError || portfolioError) {
      setDataLoadStatus('error');
      console.error("Error fetching data:", coinError || portfolioError);
      alert("Could not fetch live data. Using cached data instead.");
      return;
    }
    
    if (coins && coins.length > 0 && portfolioStatus === 'succeeded') {
      setDataLoadStatus('success');
      
      // Check if we have portfolio items
      if (portfolioItems.length === 0) {
        // If no portfolio items, use empty state
        setDynamicWalletItems([]);
        setTotalBalanceUSD("$0.00");
        setTotalBalanceChange("0.00%");
        setTotalBalanceChangeAmount("$0.00");
        setTotalBalanceTrend('up');
        setTotalPages(0);
        return;
      }
      
      // Create wallet items from portfolio items with live prices
      const walletItems = portfolioItems.map(item => {
        // Find coin data from API
        const coin = coins.find(c => c.id === item.id || c.symbol.toLowerCase() === item.symbol.toLowerCase());
        
        if (coin) {
          const amount = parseFloat(item.amount);
          // Düzeltilmiş hesaplama - API'den gelen değer doğrudan kullanılıyor
          const currentPrice = coin.current_price;
          const fiatValue = amount * currentPrice;
          
          console.log(`Processing ${item.symbol}:`, { 
            amount, 
            currentPrice,
            calculatedValue: fiatValue,
            apiPrice: coin.current_price
          });
          
          const priceChangePercent = coin.price_change_percentage_24h;
          const trend: 'up' | 'down' = priceChangePercent >= 0 ? 'up' : 'down';
          
          return {
            name: item.name,
            symbol: item.symbol,
            icon: getCoinIcon(item.symbol.toLowerCase()),
            bgColor: item.bgColor || getCoinColor(item.symbol.toLowerCase()),
            balance: item.amount,
            price: currentPrice, // Store raw price for debugging
            rawValue: fiatValue, // Store raw calculated value for accurate totals
            fiatValue: `$${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${Math.abs(priceChangePercent).toFixed(1)}%`,
            trend: trend
          };
        }
        
        // Fallback if coin not found in API
        return {
          name: item.name,
          symbol: item.symbol,
          icon: getCoinIcon(item.symbol.toLowerCase()),
          bgColor: item.bgColor || getCoinColor(item.symbol.toLowerCase()),
          balance: item.amount,
          rawValue: 0, // Default raw value
          fiatValue: item.price || "$0.00",
          change: item.percentChange || "0.00%",
          trend: item.isPositive ? 'up' : 'down' as 'up' | 'down'
        };
      });
      
      // Calculate total portfolio value based on all coins - use raw values directly
      let totalPortfolioValue = 0;
      let totalPortfolioChange = 0;
      let totalPortfolioChangeAmount = 0;
      let totalPortfolioPreviousValue = 0;
      
      walletItems.forEach(item => {
        // Use the raw value property directly instead of parsing from formatted string
        const fiatValueNumeric = item.rawValue || 0;
        
        if (fiatValueNumeric > 0) {
          totalPortfolioValue += fiatValueNumeric;
          
          // Find coin in API data to get percentage change
          const coin = coins.find(c => c.symbol === item.symbol.toLowerCase() || c.id.toLowerCase() === item.symbol.toLowerCase());
          if (coin) {
            const changePercent = coin.price_change_percentage_24h / 100; // Convert percentage to decimal
            const previousValue = fiatValueNumeric / (1 + changePercent);
            totalPortfolioPreviousValue += previousValue;
            totalPortfolioChangeAmount += (fiatValueNumeric - previousValue);
          }
        }
      });
      
      // Calculate overall portfolio change percentage
      const overallChangePercent = totalPortfolioPreviousValue > 0 
        ? ((totalPortfolioValue - totalPortfolioPreviousValue) / totalPortfolioPreviousValue) * 100
        : 0;
      
      const overallTrend: 'up' | 'down' = overallChangePercent >= 0 ? 'up' : 'down';
      
      // Format values for display - make sure the values aren't divided by 1000 unintentionally
      const formattedTotalUSD = `$${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const formattedTotalChange = `${Math.abs(overallChangePercent).toFixed(1)}%`;
      const formattedChangeAmount = `$${Math.abs(totalPortfolioChangeAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      console.log("Debug portfolio values:", { 
        totalPortfolioValue,
        formattedTotalUSD,
        totalPortfolioChangeAmount,
        overallChangePercent
      });
      
      // Update the portfolio balance with calculated values
      setTotalBalanceUSD(formattedTotalUSD);
      setTotalBalanceChange(formattedTotalChange);
      setTotalBalanceChangeAmount(formattedChangeAmount);
      setTotalBalanceTrend(overallTrend);
      setDynamicWalletItems(walletItems);
      setTotalPages(Math.ceil(walletItems.length / itemsPerPage));
    }
  }, [coins, coinError, isCoinsLoading, portfolioItems, portfolioStatus, portfolioError, itemsPerPage]);
  
  // Helper to get coin names from symbols for static data
  const getCoinNameFromSymbol = (symbol: string): string => {
    const coinNames: {[key: string]: string} = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'SOL': 'Solana',
      'BNB': 'Binance Coin',
      'AVAX': 'Avalanche',
      'DOT': 'Polkadot',
      'ADA': 'Cardano',
      'MATIC': 'Polygon',
      'LINK': 'Chainlink',
      'DOGE': 'Dogecoin'
    };
    
    return coinNames[symbol] || symbol;
  };
  
  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle time period selection
  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period);
    // Here you would typically fetch new data based on the time period
  };
  
  // Function to handle quick actions
  const handleQuickAction = (action: string) => {
    alert(`${action} action selected. This would open the ${action} interface.`);
  };
  
  // Filtered wallet items for current page
  const currentWalletItems = dynamicWalletItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const recentTransactions: TransactionItem[] = [
    {
      type: "send",
      amount: "0.042",
      coin: "Bitcoin",
      symbol: "BTC",
      date: "Apr 23, 2023 • 14:32",
      status: "completed",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: FaBitcoin,
      bgColor: "#f7931a"
    },
    {
      type: "receive",
      amount: "1.23",
      coin: "Ethereum",
      symbol: "ETH",
      date: "Apr 22, 2023 • 09:17",
      status: "completed",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      icon: FaEthereum,
      bgColor: "#627eea"
    },
    {
      type: "swap",
      amount: "12.5",
      coin: "Solana",
      symbol: "SOL",
      date: "Apr 21, 2023 • 18:45",
      status: "pending",
      address: "8ZUgn89MdEUU1pTHU8noy3WZwQJSUeJfHgbHwMRjvSSX",
      icon: SiSolana,
      bgColor: "#14f195"
    },
    {
      type: "receive",
      amount: "0.185",
      coin: "Bitcoin",
      symbol: "BTC",
      date: "Apr 20, 2023 • 11:03",
      status: "completed",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: FaBitcoin,
      bgColor: "#f7931a"
    },
    {
      type: "send",
      amount: "2.75",
      coin: "Binance Coin",
      symbol: "BNB",
      date: "Apr 19, 2023 • 16:22",
      status: "failed",
      address: "bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m",
      icon: SiBinance,
      bgColor: "#f3ba2f"
    }
  ];

  return (
    <div className="min-h-screen bg-[#21232d]">
      {/* Header */}
      <Navbar 
        title="Wallet" 
        showSearch={true}
        searchPlaceholder="Search coins..."
      />
      
      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="flex gap-6">
          <div className="w-2/3 space-y-6">
            {/* Portfolio Balance Section */}
            <div className="bg-[#121319] rounded-xl p-5 h-[230px] relative overflow-hidden">
              {/* Refresh indicator - shows when data is refreshing */}
              {dataLoadStatus === 'loading' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-semibold flex items-center">
                  Portfolio Balance
                  {dataLoadStatus === 'loading' && (
                    <div className="ml-2 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  )}
                  {dataLoadStatus === 'error' && (
                    <div className="ml-2 text-xs text-red-500 px-2 py-0.5 rounded bg-red-500/10">using cached data</div>
                  )}
                </h2>
                
                <div className="flex items-center">
                  <button 
                    className="bg-[#272b3b] h-8 px-3 py-1 rounded-lg text-sm text-white flex items-center"
                  >
                    <span>{timePeriod}</span>
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="flex ml-3">
                    <button 
                      className="bg-[#272b3b] p-1.5 rounded-l-lg hover:bg-[#323642] transition-colors"
                      onClick={() => {
                        // Handle previous time period
                        const periods = ['24 Hours', '7 Days', '30 Days', '90 Days', '1 Year'];
                        const currentIndex = periods.indexOf(timePeriod);
                        const prevIndex = (currentIndex - 1 + periods.length) % periods.length;
                        handleTimePeriodChange(periods[prevIndex]);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="bg-[#272b3b] p-1.5 rounded-r-lg hover:bg-[#323642] transition-colors"
                      onClick={() => {
                        // Handle next time period
                        const periods = ['24 Hours', '7 Days', '30 Days', '90 Days', '1 Year'];
                        const currentIndex = periods.indexOf(timePeriod);
                        const nextIndex = (currentIndex + 1) % periods.length;
                        handleTimePeriodChange(periods[nextIndex]);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div className="w-1/3">
                  <div className="bg-[#272b3b] rounded-lg p-3 mt-8">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-gray-400 text-sm">Total Balance</div>
                      <FaWallet className="text-gray-400" size={16} />
                    </div>
                    {dataLoadStatus === 'loading' ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ) : dataLoadStatus === 'error' ? (
                      <div>
                        <div className="text-white text-2xl font-bold mb-2">
                          {totalBalanceUSD}
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-sm">
                            <span>from cache</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-white text-2xl font-bold mb-2">
                          {totalBalanceUSD}
                        </div>
                        <div className="flex items-center">
                          <div className={`flex items-center ${totalBalanceTrend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} px-2 py-0.5 rounded text-sm`}>
                            {totalBalanceTrend === 'up' ? <FaArrowUp size={10} className="mr-1" /> : <FaArrowDown size={10} className="mr-1" />}
                            <span>{totalBalanceChange}</span>
                          </div>
                          <span className="text-gray-400 text-xs ml-2">({totalBalanceChangeAmount} today)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="w-2/3">
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex mb-2">
                      <div className="flex items-center space-x-2">
                        <button className={`px-3 py-1 rounded-lg text-xs ${activeCurrency === 'BTC' ? 'bg-blue-600 text-white' : 'bg-[#272b3b] text-gray-400'}`} onClick={() => setActiveCurrency('BTC')}>BTC</button>
                        <button className={`px-3 py-1 rounded-lg text-xs ${activeCurrency === 'ETH' ? 'bg-blue-600 text-white' : 'bg-[#272b3b] text-gray-400'}`} onClick={() => setActiveCurrency('ETH')}>ETH</button>
                        <button className={`px-3 py-1 rounded-lg text-xs ${activeCurrency === 'USD' ? 'bg-blue-600 text-white' : 'bg-[#272b3b] text-gray-400'}`} onClick={() => setActiveCurrency('USD')}>USD</button>
                      </div>
                    </div>
                    
                    {/* Chart based on selected currency */}
                    <div className="bg-[#272b3b] rounded-lg h-[120px] flex items-center justify-center overflow-hidden">
                      <div className="h-[80px] w-full px-4 flex items-end">
                        {chartData[activeCurrency].values.map((height: number, index: number) => (
                          <div 
                            key={index}
                            className="mx-0.5 rounded-sm transition-all duration-500 ease-in-out"
                            style={{ 
                              height: `${height}%`, 
                              width: '6%',
                              backgroundColor: chartData[activeCurrency].trend === 'up' 
                                ? `rgba(34, 197, 94, ${0.2 + (height/100) * 0.8})` 
                                : `rgba(239, 68, 68, ${0.2 + (height/100) * 0.8})`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* My Assets Section */}
            <div className="bg-[#121319] rounded-xl p-5 h-[468px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-semibold">My Assets</h2>
                
                <div className="flex items-center">
                  <div className="flex space-x-2">
                    <button 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeTab === 'coins' ? 'bg-blue-600 text-white' : 'bg-[#272b3b] text-gray-400'}`}
                      onClick={() => setActiveTab('coins')}
                    >
                      Coins
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeTab === 'nfts' ? 'bg-blue-600 text-white' : 'bg-[#272b3b] text-gray-400'}`}
                      onClick={() => setActiveTab('nfts')}
                    >
                      NFTs
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 text-xs text-gray-400 py-2 border-b border-gray-700">
                <div className="flex items-center">Asset</div>
                <div className="flex items-center">Balance</div>
                <div className="flex items-center">Value</div>
                <div className="flex items-center justify-end">Actions</div>
              </div>
              
              {/* Coins list */}
              <div className="overflow-y-auto flex-grow mt-2">
                {isCoinsLoading || portfolioStatus === 'loading' ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : dataLoadStatus === 'error' ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-red-500">Veriler yüklenirken bir hata oluştu.</p>
                  </div>
                ) : dynamicWalletItems.length === 0 ? (
                  <div className="flex items-center justify-center h-40 flex-col">
                    <p className="text-gray-400 mb-2">Portföyünüzde henüz kripto para bulunmamaktadır.</p>
                    <p className="text-blue-500 text-sm">Portföy sayfasından yeni varlıklar ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  currentWalletItems.map((wallet, index) => {
                    return (
                      <div key={index} className="grid grid-cols-4 gap-4 text-sm py-3 border-b border-gray-700/30">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: wallet.bgColor }}>
                            {typeof wallet.icon === 'function' ? 
                              React.createElement(wallet.icon as IconType, { className: "text-white", size: 16 }) : 
                              wallet.icon}
                          </div>
                          <div>
                            <div className="text-white">{wallet.name}</div>
                            <div className="text-gray-400 text-xs">{wallet.symbol}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-white">
                          {wallet.balance} {wallet.symbol}
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <div className="text-white">{wallet.fiatValue}</div>
                          <div className={`text-xs ${wallet.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {wallet.trend === 'up' ? '+' : '-'}{wallet.change}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="text-blue-500 text-xs flex items-center hover:underline"
                            onClick={() => alert(`Send ${wallet.symbol} selected. This would open the sending interface.`)}
                          >
                            <span className="mr-1">Send</span>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13 5L21 12M21 12L13 19M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="text-blue-500 text-xs flex items-center hover:underline"
                            onClick={() => alert(`Receive ${wallet.symbol} selected. This would open the receiving interface.`)}
                          >
                            <span className="mr-1">Receive</span>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 19L3 12M3 12L11 5M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="text-gray-400 text-xs">{dynamicWalletItems.length} assets</div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`text-gray-400 p-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="text-white text-xs">
                    Page <span className="bg-blue-600 text-white rounded-md px-2 py-1 mx-1">{currentPage}</span> of {totalPages}
                  </div>
                  <button 
                    className={`text-gray-400 p-1 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#121319] rounded-xl p-5">
              <h2 className="text-white text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-3 gap-3">
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => handleQuickAction('Send')}
                >
                  <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaArrowUp className="text-blue-500" size={16} />
                  </div>
                  <span className="text-white text-xs">Send</span>
                </button>
                
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => handleQuickAction('Receive')}
                >
                  <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaArrowDown className="text-green-500" size={16} />
                  </div>
                  <span className="text-white text-xs">Receive</span>
                </button>
                
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => handleQuickAction('Swap')}
                >
                  <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaExchangeAlt className="text-purple-500" size={16} />
                  </div>
                  <span className="text-white text-xs">Swap</span>
                </button>
                
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => handleQuickAction('Buy')}
                >
                  <div className="w-9 h-9 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaDollarSign className="text-yellow-500" size={16} />
                  </div>
                  <span className="text-white text-xs">Buy</span>
                </button>
                
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => handleQuickAction('Sell')}
                >
                  <div className="w-9 h-9 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaDollarSign className="text-red-500" size={16} />
                  </div>
                  <span className="text-white text-xs">Sell</span>
                </button>
                
                <button 
                  className="bg-[#272b3b] rounded-lg p-3 flex flex-col items-center justify-center text-center h-[90px] hover:bg-[#323642] transition-colors"
                  onClick={() => {
                    const moreOptions = ['Stake', 'Earn', 'Bridge', 'History'];
                    alert(`More options: ${moreOptions.join(', ')}`);
                  }}
                >
                  <div className="w-9 h-9 bg-gray-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-white text-xs">More</span>
                </button>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-[#121319] rounded-xl p-5 h-[468px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-semibold">Recent Transactions</h2>
                <button className="text-blue-500 text-xs hover:underline">View All</button>
              </div>
              
              {/* Transaction Tabs */}
              <div className="flex text-sm mb-4 border-b border-gray-700">
                <button 
                  className={`mr-6 py-2 ${activeHistoryTab === 'all' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setActiveHistoryTab('all')}
                >
                  All
                </button>
                <button 
                  className={`mr-6 py-2 ${activeHistoryTab === 'sent' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setActiveHistoryTab('sent')}
                >
                  Sent
                </button>
                <button 
                  className={`mr-6 py-2 ${activeHistoryTab === 'received' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setActiveHistoryTab('received')}
                >
                  Received
                </button>
                <button 
                  className={`mr-6 py-2 ${activeHistoryTab === 'swapped' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400'}`}
                  onClick={() => setActiveHistoryTab('swapped')}
                >
                  Swapped
                </button>
              </div>
              
              {/* Transactions list */}
              <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[#272b3b] scrollbar-track-transparent">
                {recentTransactions
                  .filter(tx => {
                    if (activeHistoryTab === 'all') return true;
                    if (activeHistoryTab === 'sent') return tx.type === 'send';
                    if (activeHistoryTab === 'received') return tx.type === 'receive';
                    if (activeHistoryTab === 'swapped') return tx.type === 'swap';
                    return true;
                  })
                  .map((tx, index) => {
                    const Icon = tx.icon;
                    return (
                      <div key={index} className="py-3 border-b border-gray-700/30">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: tx.bgColor }}>
                              <Icon className="text-white" size={14} />
                            </div>
                            <div>
                              <div className="text-white text-sm">
                                {tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Swapped'} {tx.coin}
                              </div>
                              <div className="text-gray-400 text-xs">{tx.date}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-medium ${
                              tx.type === 'receive' ? 'text-green-500' : 
                              tx.type === 'send' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                              {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : '↔'} {tx.amount} {tx.symbol}
                            </div>
                            <div className={`text-xs ${
                              tx.status === 'completed' ? 'text-green-500' : 
                              tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-[#272b3b] rounded-lg p-2 text-gray-400 text-xs truncate cursor-pointer hover:bg-[#323642] transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(tx.address);
                            alert('Address copied to clipboard');
                          }}
                          title="Click to copy address"
                        >
                          {tx.address}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="bg-[#121319] rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Kriptopara Listesi</h2>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                onClick={() => alert('This would open the full list of cryptocurrencies')}
              >
                View All
              </button>
            </div>
            <CoinList />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add display name for ESLint rule
Wallet.displayName = 'Wallet';
