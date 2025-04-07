'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchCoinsQuery, useGetCoinByIdQuery, CoinSearchResult } from '@/redux/services/coinApi';
import { addCoinToPortfolio, PortfolioItem } from '@/redux/slices/portfolioSlice';
import { FaPlus, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { AppDispatch, RootState } from '@/redux/store';
import { getCoinColor } from '@/utils/coinHelper';
import Image from 'next/image';

interface CoinWithPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

const CoinSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<CoinWithPrice | null>(null);
  const [loadingCoinData, setLoadingCoinData] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { items: portfolioItems } = useSelector((state: RootState) => state.portfolio);
  
  // Use the search endpoint
  const { data: searchResults = [], isLoading: isSearchLoading } = useSearchCoinsQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2
  });
  
  // Fetch detailed coin data when a coin is selected 
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const { data: coinDetails } = useGetCoinByIdQuery(selectedCoinId || 'bitcoin', {
    skip: !selectedCoinId
  });
  
  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Handle coin details loading
  useEffect(() => {
    if (coinDetails && selectedCoinId) {
      setSelectedCoin({
        id: coinDetails.id,
        name: coinDetails.name,
        symbol: coinDetails.symbol,
        current_price: coinDetails.current_price,
        image: coinDetails.image
      });
      setLoadingCoinData(false);
    }
  }, [coinDetails, selectedCoinId]);
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    if (e.target.value.length >= 2) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  };
  
  const handleSelectCoin = (coin: CoinSearchResult) => {
    setSelectedCoinId(coin.id);
    setSearchTerm('');
    setIsSearchOpen(false);
    setLoadingCoinData(true);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers, dot, and empty string
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*$/;
    
    if (value === '' || regex.test(value)) {
      setAmount(value);
    }
  };
  
  const handleAddToPortfolio = () => {
    if (selectedCoin && amount) {
      try {
        // Check if coin already exists in portfolio
        const exists = portfolioItems.some(item => item.id === selectedCoin.id);
        
        if (exists) {
          alert(`${selectedCoin.name} already exists in your portfolio.`);
          return;
        }
        
        const portfolioItem: PortfolioItem = {
          id: selectedCoin.id,
          name: selectedCoin.name,
          symbol: selectedCoin.symbol.toUpperCase(),
          amount: amount,
          price: `$${selectedCoin.current_price.toLocaleString()}`,
          bgColor: getCoinColor(selectedCoin.symbol),
          isPositive: true, // Default for new additions
          percentChange: '0.00%'
        };
        
        console.log("Dispatching add coin to portfolio:", portfolioItem);
        
        // Add loading state before dispatching
        setLoadingCoinData(true);
        
        dispatch(addCoinToPortfolio(portfolioItem))
          .unwrap()
          .then(() => {
            // Clear form and show success message only after successful add
            setSelectedCoin(null);
            setSelectedCoinId(null);
            setAmount('');
            setLoadingCoinData(false);
            alert(`${selectedCoin.name} has been added to your portfolio!`);
          })
          .catch((error) => {
            setLoadingCoinData(false);
            console.error("Failed to add coin:", error);
            alert(`Failed to add ${selectedCoin.name} to your portfolio. Error: ${error.message || error}`);
          });
      } catch (error: unknown) {
        setLoadingCoinData(false);
        console.error("Error in handleAddToPortfolio:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add coin to portfolio';
        alert(`An error occurred: ${errorMessage}`);
      }
    }
  };
  
  const clearSelection = () => {
    setSelectedCoin(null);
    setSelectedCoinId(null);
    setSearchTerm('');
    setAmount('');
  };
  
  return (
    <div className="w-full p-4 bg-[#1a1c25] rounded-xl border border-gray-700 mb-4 shadow-lg">
      <h3 className="text-base font-bold mb-3 text-white flex items-center">
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 w-1 h-4 mr-2 rounded-sm inline-block"></span>
        Add Coin to Portfolio
      </h3>
      
      {selectedCoin ? (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-4 bg-[#272b3b] p-2.5 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2.5" style={{ backgroundColor: getCoinColor(selectedCoin.symbol) }}>
                {selectedCoin.symbol.toUpperCase().substring(0, 1)}
              </div>
              <div>
                <div className="font-medium text-white text-sm">{selectedCoin.name}</div>
                <div className="text-xs text-gray-400">{selectedCoin.symbol.toUpperCase()}</div>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#31354a] transition-all duration-200"
              onClick={clearSelection}
            >
              <FaTimes size={12} />
            </button>
          </div>
          
          <div className="mb-3 bg-[#272b3b] p-2.5 rounded-lg">
            <div className="text-xs text-gray-400 mb-0.5">Current Price</div>
            <div className="font-medium text-white text-sm">${selectedCoin.current_price.toLocaleString()}</div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs text-gray-300 mb-1 font-medium">Amount</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-[#272b3b] border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-xs">{selectedCoin.symbol.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs bg-[#272b3b] px-2.5 py-1.5 rounded-lg text-gray-300">
              {amount && !isNaN(parseFloat(amount)) && selectedCoin.current_price ? (
                <span>Total: <span className="text-white font-medium">${(parseFloat(amount) * selectedCoin.current_price).toLocaleString()}</span></span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
            <button 
              className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3.5 rounded-lg flex items-center text-sm font-medium transition-all duration-200 ${!amount || loadingCoinData ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
              onClick={handleAddToPortfolio}
              disabled={!amount || loadingCoinData}
            >
              {loadingCoinData ? (
                <FaSpinner size={12} className="mr-1.5" />
              ) : (
                <FaPlus size={12} className="mr-1.5" />
              )}
              Add to Portfolio
            </button>
          </div>
        </div>
      ) : loadingCoinData ? (
        <div className="flex justify-center items-center py-8 animate-pulse">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-500 mb-2" size={24} />
            <span className="text-gray-300 text-sm">Loading coin data...</span>
          </div>
        </div>
      ) : (
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-[#272b3b] border border-gray-700 rounded-lg p-2.5 pl-9 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
              placeholder="Search for a coin..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {isSearchLoading ? (
              <FaSpinner className="absolute left-3 top-3 text-gray-400 animate-spin" size={14} />
            ) : (
              <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
            )}
          </div>
          
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1.5 w-full bg-[#272b3b] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
              {searchResults.map((coin) => (
                <div 
                  key={coin.id} 
                  className="p-2.5 hover:bg-[#3a3c47] cursor-pointer flex items-center transition-colors duration-150"
                  onClick={() => handleSelectCoin(coin)}
                >
                  <Image 
                    src={coin.thumb} 
                    alt={coin.name} 
                    width={28} 
                    height={28} 
                    className="w-7 h-7 rounded-full mr-2.5 border border-gray-600" 
                  />
                  <div>
                    <div className="font-medium text-white text-sm">{coin.name}</div>
                    <div className="text-xs text-gray-400">{coin.symbol.toUpperCase()}</div>
                  </div>
                  {coin.market_cap_rank && (
                    <div className="ml-auto text-xs bg-gray-700 rounded-full px-2 py-1 text-gray-300">
                      #{coin.market_cap_rank}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {isSearchOpen && searchTerm.length >= 2 && searchResults.length === 0 && !isSearchLoading && (
            <div className="absolute z-10 mt-1.5 w-full bg-[#272b3b] border border-gray-700 rounded-lg shadow-xl p-3 text-center">
              <div className="text-gray-400 text-sm">No coins found matching &ldquo;{searchTerm}&rdquo;</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinSearch; 