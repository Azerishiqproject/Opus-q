'use client';

import { useState, useContext, useEffect } from 'react';
import { HiMenuAlt2, HiBell } from 'react-icons/hi';
import { FaBitcoin, FaEthereum, FaArrowUp, FaArrowDown, FaExchangeAlt, FaDollarSign, FaWallet } from 'react-icons/fa';
import { SiLitecoin, SiSolana, SiBinance } from 'react-icons/si';
import { SidebarContext } from '@/app/ClientLayout';
import { IconType } from 'react-icons';
import CoinList from '@/components/CoinList';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import React, { ReactNode } from 'react';

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

export default function Wallet() {
  const { toggleSidebar } = useContext(SidebarContext);
  const [activeTab, setActiveTab] = useState('coins');
  const [activeHistoryTab, setActiveHistoryTab] = useState('all');
  const [activeCurrency, setActiveCurrency] = useState('BTC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // API'dan verileri çekme
  const { data: coins, error, isLoading } = useGetCoinsQuery();
  
  // Dinamik portföy verileri
  const [dynamicWalletItems, setDynamicWalletItems] = useState<WalletItem[]>([]);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState("0");
  const [totalBalanceChange, setTotalBalanceChange] = useState("0");
  const [totalBalanceChangeAmount, setTotalBalanceChangeAmount] = useState("0");
  const [totalBalanceTrend, setTotalBalanceTrend] = useState<'up' | 'down'>('up');
  
  // Pagination functionality
  const itemsPerPage = 5;
  const [timePeriod, setTimePeriod] = useState('7 Days');
  
  // API'dan gelen verileri işle
  useEffect(() => {
    if (coins && coins.length > 0) {
      // Rastgele miktar oluşturmak için fonksiyon
      const getRandomAmount = (min: number, max: number, decimals: number) => {
        return (Math.random() * (max - min) + min).toFixed(decimals);
      };
      
      // İlk 5 coin için portföy öğeleri oluştur
      const walletItems = coins.slice(0, 10).map(coin => {
        const randomBalance = getRandomAmount(0.1, 10, 4);
        const fiatValue = (parseFloat(randomBalance) * coin.current_price).toFixed(2);
        const priceChangePercent = coin.price_change_percentage_24h;
        const trend: 'up' | 'down' = priceChangePercent >= 0 ? 'up' : 'down';
        
        return {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: getCoinIcon(coin.symbol),
          bgColor: getCoinColor(coin.symbol),
          balance: randomBalance,
          fiatValue: `$${parseFloat(fiatValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${Math.abs(priceChangePercent).toFixed(1)}%`,
          trend: trend
        };
      });
      
      // Toplam portföy değerini hesapla
      let totalUSD = 0;
      let totalChangePercent = 0;
      
      walletItems.forEach(item => {
        totalUSD += parseFloat(item.fiatValue.replace('$', '').replace(',', ''));
      });
      
      // Ortalama değişim yüzdesini hesapla (basitleştirilmiş)
      if (coins.length > 0) {
        const btcChangePercent = coins[0].price_change_percentage_24h;
        const changeAmount = (totalUSD * btcChangePercent / 100).toFixed(2);
        
        totalChangePercent = btcChangePercent;
        setTotalBalanceChangeAmount(`$${Math.abs(parseFloat(changeAmount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        setTotalBalanceTrend(totalChangePercent >= 0 ? 'up' : 'down');
      }
      
      setTotalBalanceUSD(`$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setTotalBalanceChange(`${Math.abs(totalChangePercent).toFixed(1)}%`);
      setDynamicWalletItems(walletItems);
      setTotalPages(Math.ceil(walletItems.length / itemsPerPage));
    }
  }, [coins]);
  
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
      <header className="bg-[#21232d] p-5 flex items-center justify-between border-b border-[#272b3b]">
        <div className="flex items-center">
          <button className="text-white cursor-pointer p-2 mr-2" onClick={toggleSidebar}>
            <HiMenuAlt2 size={20} />
          </button>
          <h1 className="text-white text-2xl font-semibold">Wallet</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assets..."
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
            <div className="w-8 h-8 bg-gray-500 rounded-[10px]"></div>
            <div className="text-white">
              <span className="text-base">Wizard Labs</span>
              <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="flex gap-6">
          <div className="w-2/3 space-y-6">
            {/* Portfolio Balance Section */}
            <div className="bg-[#121319] rounded-xl p-5 h-[230px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-semibold">Portfolio Balance</h2>
                
                <div className="flex items-center">
                  <button 
                    className="bg-[#272b3b] h-8 px-3 py-1 rounded-lg text-sm text-white flex items-center"
                    onClick={() => {
                      const periods = ['24 Hours', '7 Days', '30 Days', '90 Days', '1 Year'];
                      const currentIndex = periods.indexOf(timePeriod);
                      const nextIndex = (currentIndex + 1) % periods.length;
                      handleTimePeriodChange(periods[nextIndex]);
                    }}
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
                  <div className="bg-[#272b3b] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-gray-400 text-sm">Total Balance</div>
                      <FaWallet className="text-gray-400" size={16} />
                    </div>
                    {isLoading ? (
                      <div className="text-white text-2xl font-bold mb-2">Loading...</div>
                    ) : error ? (
                      <div className="text-red-500 text-2xl font-bold mb-2">Error</div>
                    ) : (
                      <>
                        <div className="text-white text-2xl font-bold mb-2">{totalBalanceUSD}</div>
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
                    
                    {/* Chart placeholder */}
                    <div className="bg-[#272b3b] rounded-lg h-[120px] flex items-center justify-center">
                      <div className="h-[80px] w-full px-4 flex items-end">
                        <div className="h-[40%] w-[8%] bg-green-500/20 rounded-sm mx-1"></div>
                        <div className="h-[60%] w-[8%] bg-green-500/20 rounded-sm mx-1"></div>
                        <div className="h-[45%] w-[8%] bg-green-500/20 rounded-sm mx-1"></div>
                        <div className="h-[70%] w-[8%] bg-green-500/20 rounded-sm mx-1"></div>
                        <div className="h-[55%] w-[8%] bg-green-500/20 rounded-sm mx-1"></div>
                        <div className="h-[80%] w-[8%] bg-green-500/40 rounded-sm mx-1"></div>
                        <div className="h-[65%] w-[8%] bg-green-500/60 rounded-sm mx-1"></div>
                        <div className="h-[90%] w-[8%] bg-green-500 rounded-sm mx-1"></div>
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
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-red-500">Veriler yüklenirken bir hata oluştu.</p>
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
