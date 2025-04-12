'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { HiMenuAlt2, HiBell, HiSearch } from 'react-icons/hi';
import { FaSpinner } from 'react-icons/fa';
import { SidebarContext } from '@/app/ClientLayout';
import Link from 'next/link';
import { useSearchCoinsQuery, CoinSearchResult } from '@/redux/services/coinApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NavbarProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
}

const Navbar = ({ 
  title, 
  showSearch = true, 
  onSearch,
  searchPlaceholder = "Search coins..." 
}: NavbarProps) => {
  const { toggleSidebar } = useContext(SidebarContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Fetch search results
  const { data: searchResults = [], isLoading: isSearchLoading } = useSearchCoinsQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2
  });
  
  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
    
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handleSelectCoin = (coin: CoinSearchResult) => {
    setSearchTerm('');
    setShowSearchResults(false);
    // Navigate to coin details page
    router.push(`/coin/${coin.id}`);
  };
  
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };
  
  return (
    <header className="bg-[#21232d] p-5 flex items-center justify-between border-b border-[#272b3b]">
      <div className="flex items-center">
        <button className="text-white cursor-pointer p-2 mr-2" onClick={toggleSidebar}>
          <HiMenuAlt2 size={20} />
        </button>
        <h1 className="text-white text-2xl font-bold">{title}</h1>
      </div>

      {showSearch && (
        <div className="flex items-center space-x-4">
          <div className="relative" ref={searchResultsRef}>
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                className="bg-[#121319] text-gray-300 rounded-xl py-2 pl-10 pr-4 w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm border border-[#272b3b]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearchLoading ? (
                  <FaSpinner className="text-gray-400 animate-spin" size={16} />
                ) : (
                  <HiSearch className="text-gray-400" size={16} />
                )}
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && debouncedSearchTerm.length >= 2 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#272b3b] rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {isSearchLoading ? (
                  <div className="p-4 flex justify-center items-center">
                    <FaSpinner className="animate-spin text-gray-400" size={20} />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No coins found
                  </div>
                ) : (
                  <div>
                    {searchResults.slice(0, 8).map((coin) => (
                      <div 
                        key={coin.id}
                        className="flex items-center p-3 hover:bg-[#31354a] cursor-pointer transition-colors"
                        onClick={() => handleSelectCoin(coin)}
                      >
                        <div className="w-8 h-8 mr-3 flex-shrink-0">
                          {coin.thumb && (
                            <Image 
                              src={coin.thumb}
                              alt={coin.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{coin.name}</div>
                          <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                        </div>
                        {coin.market_cap_rank && (
                          <div className="ml-auto bg-[#21232d] px-2 py-1 rounded text-xs text-gray-400">
                            #{coin.market_cap_rank}
                          </div>
                        )}
                      </div>
                    ))}
                    {searchResults.length > 8 && (
                      <div className="p-2 text-center text-blue-500 text-sm hover:underline cursor-pointer border-t border-gray-700">
                        View all results
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <button className="p-2 bg-[#272b3b] rounded-[10px] relative">
          <HiBell className="text-gray-400" size={20} />
        </button>
        
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            <div className="w-8 h-8 bg-gray-500 rounded-[10px]"></div>
            <div className="text-white">
              <span className="text-base">Yılmaz</span>
              <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#272b3b] rounded-lg shadow-lg z-10">
              <div className="py-1">
                <Link 
                  href="/settings" 
                  className="block px-4 py-2 text-sm text-white hover:bg-[#31354a]"
                >
                  Settings
                </Link>
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-sm text-white hover:bg-[#31354a]"
                >
                  Profile
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#31354a]"
                  onClick={() => alert('Logout functionality not implemented')}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 