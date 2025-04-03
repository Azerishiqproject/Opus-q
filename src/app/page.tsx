'use client';

import { useState } from 'react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiRipple } from 'react-icons/si';
import { HiMenuAlt2 } from 'react-icons/hi';
import { IoBook, IoArrowUp } from 'react-icons/io5';
import Sidebar from '@/components/Sidebar';
import Portfolio from '@/components/Portfolio';
import { IconType } from 'react-icons';

interface CryptoCard {
  name: string;
  symbol: string;
  icon: IconType;
  bgColor: string;
  price: string;
  amount: string;
  trend: 'up' | 'down';
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isPortfolioOpen) setIsPortfolioOpen(false);
  };

  const togglePortfolio = () => {
    setIsPortfolioOpen(!isPortfolioOpen);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const cryptoCards: CryptoCard[] = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      icon: FaBitcoin,
      bgColor: "#f7931a",
      price: "$26927",
      amount: "2.05 BTC",
      trend: "down"
    },
    {
      name: "Zilliqa",
      symbol: "ZIL",
      icon: () => <span className="text-white font-bold text-lg">Z</span>,
      bgColor: "#49c1bf",
      price: "$26927",
      amount: "2.05 ZIL",
      trend: "down"
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      icon: FaEthereum,
      bgColor: "#627eea",
      price: "$503.12",
      amount: "50 ETH",
      trend: "up"
    },
    {
      name: "Stake",
      symbol: "STK",
      icon: () => <span className="text-white font-bold text-lg">S</span>,
      bgColor: "#00bcd4",
      price: "$503.12",
      amount: "50 STK",
      trend: "up"
    },
    {
      name: "Ripple",
      symbol: "XRP",
      icon: SiRipple,
      bgColor: "#0085c0",
      price: "$4637",
      amount: "2.05 LTC",
      trend: "up"
    },
    {
      name: "Litecoin",
      symbol: "LTC",
      icon: SiLitecoin,
      bgColor: "#bfbbbb",
      price: "$6927",
      amount: "2.05 LTC",
      trend: "up"
    }
  ];

  return (
    <div className="flex h-screen bg-[#3a3c47] text-white">
      {/* Sidebar - using transform for animation */}
      <div className={`fixed top-0 left-0 h-full w-[220px]  transform transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Portfolio - using transform for animation */}
      <div className={`fixed top-0 right-0 h-full w-[320px]  transform transition-transform duration-300 ease-in-out z-30 ${isPortfolioOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Portfolio isOpen={true} onClose={() => setIsPortfolioOpen(false)} />
      </div>

      {/* Main Content Container */}
      <div className={`flex flex-col w-full h-full overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-[220px]' : ''} ${isPortfolioOpen ? 'mr-[320px]' : ''}`}>
        {/* Header with ticker */}
        <header className="flex items-center justify-between py-3 px-4 border-b border-gray-700 bg-[#3a3c47] sticky top-0 z-10">
          <button className="text-white cursor-pointer" onClick={toggleSidebar}>
            <HiMenuAlt2 size={24} />
          </button>


          
          <div className="flex items-center space-x-6 overflow-x-auto text-sm scrollbar-hide">
            <div className="flex items-center whitespace-nowrap">
              <span>BTC/USD</span>
              <span className="ml-2 text-red-500">-0.96</span>
              <span className="ml-1 text-gray-400">19,965.75</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <span>ETH/USD</span>
              <span className="ml-2 text-red-500">-7.66</span>
              <span className="ml-1 text-gray-400">1,409.85</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <span>MATIC/USD</span>
              <span className="ml-2 text-red-500">-2.79</span>
              <span className="ml-1 text-gray-400">1.0381</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <span>SOL/USD</span>
              <span className="ml-2 text-red-500">-2.15</span>
              <span className="ml-1 text-gray-400">17.71</span>
            </div>
          </div>
          
          <button className="text-white cursor-pointer" onClick={togglePortfolio}>
            <IoBook size={24} />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto mt-32">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome Back :)</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto w-full">
            {cryptoCards.map((crypto, index) => {
              const Icon = crypto.icon;
              return (
                <div key={index} className="flex items-center justify-between bg-[#2c2e38] p-4 rounded-xl">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: crypto.bgColor }}>
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{crypto.name}</h3>
                      <p className="text-gray-400 text-xs">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <svg width="80" height="24" viewBox="0 0 100 30">
                        <path 
                          d={crypto.trend === "down" 
                            ? "M0,15 L16.6,10 L33.3,20 L50,5 L66.6,15 L83.3,10 L100,15" 
                            : "M0,15 L16.6,18 L33.3,12 L50,20 L66.6,10 L83.3,15 L100,10"} 
                          fill="none" 
                          stroke={crypto.trend === "down" ? "#f44336" : "#4caf50"} 
                          strokeWidth="2" 
                        />
                      </svg>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-base">{crypto.price}</h3>
                      <p className="text-gray-400 text-xs">{crypto.amount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Search bar at bottom */}
        <div className={`fixed bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ${isSidebarOpen ? 'ml-[220px]' : ''} ${isPortfolioOpen ? 'mr-[280px]' : ''}`}>
          <div className="bg-white rounded-full w-11/12 max-w-lg flex items-center p-2 px-4">
            <input 
              type="text" 
              className="w-full bg-transparent text-gray-800 outline-none" 
              placeholder="Ready for you ..." 
            />
            <button className="text-gray-500 rounded-full hover:bg-gray-200 cursor-pointer p-2">
              <IoArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
