'use client';

import { useState, useContext } from 'react';
import { HiMenuAlt2, HiSearch } from 'react-icons/hi';
import { IoNotifications } from 'react-icons/io5';
import { SidebarContext } from '@/app/ClientLayout';
import { useRouter } from 'next/navigation';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export default function News() {
  const { toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const newsItems: NewsItem[] = [
    {
      id: 'news-1',
      title: "Bitcoin Surges Past $60,000 as Institutional Interest Grows",
      content: "Bitcoin has experienced a significant price increase, reaching a new high for the year. The surge is attributed to growing institutional interest, with major financial firms increasing their Bitcoin holdings. Analysts suggest that the approval of spot Bitcoin ETFs and global economic uncertainty have contributed to the rise.",
      image: "/bitcoin-news.jpg",
      author: "Efe Turgut",
      date: "May 31, 2023",
      category: "Bitcoin",
      readTime: "3 min read"
    },
    {
      id: 'news-2',
      title: "Ethereum's Shanghai Upgrade Set to Transform the Network",
      content: "Ethereum's upcoming Shanghai upgrade is expected to bring significant changes to the network, including enabling staked ETH withdrawals. This long-awaited feature will allow validators to access their staked ETH and rewards, potentially increasing participation in Ethereum's proof-of-stake consensus mechanism.",
      image: "/ethereum-news.jpg",
      author: "Hasan Güzeller",
      date: "June 2, 2023",
      category: "Ethereum",
      readTime: "4 min read"
    },
    {
      id: 'news-3',
      title: "Regulatory Clarity Emerges for Cryptocurrencies in Europe",
      content: "European regulators have introduced a new framework for cryptocurrency regulation, providing much-needed clarity for businesses and investors. The new rules establish guidelines for crypto asset service providers and aim to protect consumers while fostering innovation in the blockchain space.",
      image: "/regulation-news.jpg",
      author: "Efe Turgut",
      date: "June 5, 2023",
      category: "Regulation",
      readTime: "5 min read"
    },
    {
      id: 'news-4',
      title: "DeFi Projects See Surge in Total Value Locked",
      content: "Decentralized finance (DeFi) protocols have experienced a significant increase in total value locked (TVL) over the past month. This growth suggests renewed confidence in the DeFi sector, with investors seeking alternatives to traditional financial services amidst global banking concerns.",
      image: "/defi-news.jpg",
      author: "Hasan Güzeller",
      date: "June 8, 2023",
      category: "DeFi",
      readTime: "3 min read"
    },
    {
      id: 'news-5',
      title: "NFT Market Shows Signs of Recovery After Year-Long Slump",
      content: "The non-fungible token (NFT) market is showing signs of recovery after a prolonged downturn. Trading volumes have increased, and new projects are attracting attention. Experts attribute this revival to innovations in utility-focused NFTs and increased integration with gaming and metaverse platforms.",
      image: "/nft-news.jpg",
      author: "Efe Turgut",
      date: "June 12, 2023",
      category: "NFTs",
      readTime: "4 min read"
    },
    {
      id: 'news-6',
      title: "Central Banks Accelerate CBDC Development Worldwide",
      content: "Central banks around the world are accelerating their research and development of Central Bank Digital Currencies (CBDCs). This trend reflects growing recognition of the importance of digital assets in the future of finance, with several major economies planning pilot programs in the coming months.",
      image: "/cbdc-news.jpg",
      author: "Hasan Güzeller",
      date: "June 15, 2023",
      category: "CBDCs",
      readTime: "5 min read"
    }
  ];

  // Filter news by search query and category
  const filteredNews = newsItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(newsItems.map(item => item.category)))];

  // Navigate to news detail page
  const handleNewsClick = (newsId: string) => {
    router.push(`/news/${newsId}`);
  };

  const getCategoryIconBg = (category: string) => {
    switch(category) {
      case 'Bitcoin': return 'bg-orange-400';
      case 'Ethereum': return 'bg-blue-400';
      case 'Regulation': return 'bg-green-400';
      case 'DeFi': return 'bg-teal-400';
      case 'NFTs': return 'bg-purple-400';
      case 'CBDCs': return 'bg-cyan-400';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Bitcoin': return 'B';
      case 'Ethereum': return 'E';
      case 'Regulation': return 'R';
      case 'DeFi': return 'D';
      case 'NFTs': return 'N';
      case 'CBDCs': return 'C';
      default: return '?';
    }
  };

  return (
    <div className="min-h-screen bg-[#21232d]">
      <div className="flex flex-col h-screen">
        {/* Header - Hidden to match the screenshot */}
        <header className="hidden">
          <div className="flex items-center">
            <button className="text-white cursor-pointer p-2 mr-2" onClick={toggleSidebar}>
              <HiMenuAlt2 size={20} />
            </button>
            <h1 className="text-white text-2xl font-bold">Crypto News</h1>
          </div>

          <div className="relative">
            <div className="flex items-center bg-[#121319] rounded-xl pr-4 w-[300px] border border-[#272b3b]">
              <div className="pl-3 flex items-center pointer-events-none">
                <HiSearch className="text-gray-400" size={16} />
              </div>
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-gray-300 py-2 pl-2 w-full focus:outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-[#272b3b] rounded-[10px] relative hover:bg-[#323642] transition-colors">
              <IoNotifications className="text-gray-400" size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-[10px] flex items-center justify-center text-white font-medium">W</div>
              <div className="text-white flex items-center">
                <span className="text-base">Wizard Labs</span>
                <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </header>
        
        {/* Category Filter - Exactly matching screenshot */}
        <div className="flex space-x-2 p-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#272b3b] text-gray-300 hover:bg-[#323642]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* News Grid - Exactly matching screenshot */}
        <div className="px-6 py-2 flex-grow overflow-y-auto">
          {filteredNews.length === 0 ? (
            <div className="bg-[#121319] rounded-xl p-10 text-center">
              <h3 className="text-white text-xl font-semibold mb-2">No news found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredNews.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-[#121319] rounded-xl overflow-hidden cursor-pointer hover:bg-[#1a1b23] transition-colors flex"
                  onClick={() => handleNewsClick(item.id)}
                >
                  {/* Left side - Icon with category */}
                  <div style={{width: '200px'}} className="relative flex items-center justify-center bg-[#121319]">
                    <div 
                      className={`${getCategoryIconBg(item.category)} text-white absolute top-4 left-4 px-2 py-1 rounded-md z-10 text-xs font-medium`}
                    >
                      {item.category}
                    </div>
                    
                    <div className={`${getCategoryIconBg(item.category)} w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-3xl font-bold`}>
                      {getCategoryIcon(item.category)}
                    </div>
                  </div>
                  
                  {/* Right side - Content */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    {/* Date and Read Time */}
                    <div className="text-gray-400 text-xs flex items-center mb-2">
                      <span>{item.date}</span>
                      <span className="mx-2">•</span>
                      <span>{item.readTime}</span>
                    </div>
                    
                    {/* Title and Content */}
                    <div>
                      <h2 className="text-white text-xl font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title}</h2>
                      <p className="text-gray-300 text-sm line-clamp-3">{item.content}</p>
                    </div>
                    
                    {/* Author info */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${item.author === "Efe Turgut" ? 'bg-purple-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                          {item.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm">{item.author}</p>
                          <p className="text-gray-400 text-xs">{item.author === "Efe Turgut" ? 'Editor' : 'Contributor'}</p>
                        </div>
                      </div>
                      
                      <button className="text-gray-500 hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
