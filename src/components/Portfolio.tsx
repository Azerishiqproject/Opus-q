'use client';

import React, { useEffect, useCallback } from 'react';
import { FaTrash, FaSync } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPortfolio, removeCoinFromPortfolio, PortfolioItem } from '@/redux/slices/portfolioSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { getCoinIcon, getCoinColor } from '@/utils/coinHelper';
import CoinSearch from './CoinSearch';

interface PortfolioProps {
  isOpen: boolean;
  onClose?: () => void;
  portfolioItems?: PortfolioItem[];
}

const Portfolio: React.FC<PortfolioProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error } = useSelector((state: RootState) => state.portfolio);
  
  const loadPortfolio = useCallback(() => {
    console.log("Loading portfolio data...");
    dispatch(fetchUserPortfolio());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      loadPortfolio();
    }
  }, [isOpen, status, loadPortfolio]);
  
  const handleRemoveCoin = (coin: PortfolioItem) => {
    if (confirm(`Are you sure you want to remove ${coin.name} from your portfolio?`)) {
      dispatch(removeCoinFromPortfolio(coin))
        .unwrap()
        .then(() => {
          alert(`${coin.name} has been removed from your portfolio.`);
        })
        .catch((error) => {
          console.error("Failed to remove coin:", error);
          alert(`Failed to remove ${coin.name}. Please try again.`);
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-[#121319] text-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Portfolio</h2>
        <div className="flex items-center">
          {status !== 'loading' && (
            <button 
              className="text-gray-400 hover:text-white rounded-full hover:bg-[#272b3b] p-2 transition-colors mr-2"
              onClick={loadPortfolio}
              title="Refresh"
            >
              <FaSync size={14} />
            </button>
          )}
          {onClose && (
            <button 
              className="text-gray-400 hover:text-white rounded-full hover:bg-[#272b3b] p-2 transition-colors"
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search component */}
      <div className="px-4 pt-4">
        <CoinSearch />
      </div>

      {/* Portfolio items */}
      <div className="flex-1 p-4">
        {status === 'loading' ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#272b3b] rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        ) : status === 'failed' ? (
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v8M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-red-500 mb-2">Failed to load portfolio</h3>
            <p className="text-gray-400 mb-4">
              {error || 'Could not connect to the database. Please try again later.'}
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={loadPortfolio}
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No coins in your portfolio</h3>
            <p className="text-gray-400 mb-4">Use the search above to find and add cryptocurrencies to your portfolio.</p>
            <p className="text-blue-400 text-sm">All your coins will be saved in your account</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const Icon = item.icon ? (item.icon as IconType) : getCoinIcon(item.symbol);
              const bgColor = item.bgColor || getCoinColor(item.symbol);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-[#3a3c47] rounded-lg transition-all hover:shadow-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: bgColor }}>
                      {typeof Icon === 'function' ? (
                        <Icon className="text-white" size={16} />
                      ) : (
                        <span className="text-white font-bold">{item.symbol.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <p className={`text-sm ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {item.isPositive ? '+' : '-'}{item.percentChange}
                      </p>
                      <p className="text-sm text-gray-400">{item.amount} {item.symbol}</p>
                    </div>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#272b3b] rounded-full transition-colors"
                      onClick={() => handleRemoveCoin(item)}
                      title="Remove coin"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio; 