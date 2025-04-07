'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import { FaRegBookmark, FaBookmark, FaShare } from 'react-icons/fa';

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

// Mock news data - in a real app this would be fetched from an API
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
    author: "Hasan Talha Güzeller",
    date: "June 2, 2023",
    category: "Ethereum",
    readTime: "4 min read"
  },
  {
    id: 'news-3',
    title: "Regulatory Clarity Emerges for Cryptocurrencies in Europe",
    content: "European regulators have introduced a new framework for cryptocurrency regulation, providing much-needed clarity for businesses and investors. The new rules establish guidelines for crypto asset service providers and aim to protect consumers while fostering innovation in the blockchain space.",
    image: "/regulation-news.jpg",
    author: "ümid Rzayev ",
    date: "June 5, 2023",
    category: "Regulation",
    readTime: "5 min read"
  },
  {
    id: 'news-4',
    title: "DeFi Projects See Surge in Total Value Locked",
    content: "Decentralized finance (DeFi) protocols have experienced a significant increase in total value locked (TVL) over the past month. This growth suggests renewed confidence in the DeFi sector, with investors seeking alternatives to traditional financial services amidst global banking concerns.",
    image: "/defi-news.jpg",
    author: "Ege Yavuz ",
    date: "June 8, 2023",
    category: "DeFi",
    readTime: "3 min read"
  },
  {
    id: 'news-5',
    title: "NFT Market Shows Signs of Recovery After Year-Long Slump",
    content: "The non-fungible token (NFT) market is showing signs of recovery after a prolonged downturn. Trading volumes have increased, and new projects are attracting attention. Experts attribute this revival to innovations in utility-focused NFTs and increased integration with gaming and metaverse platforms.",
    image: "/nft-news.jpg",
    author: "Yılmaz Coşkun",
    date: "June 12, 2023",
    category: "NFTs",
    readTime: "4 min read"
  },
  {
    id: 'news-6',
    title: "Central Banks Accelerate CBDC Development Worldwide",
    content: "Central banks around the world are accelerating their research and development of Central Bank Digital Currencies (CBDCs). This trend reflects growing recognition of the importance of digital assets in the future of finance, with several major economies planning pilot programs in the coming months.",
    image: "/cbdc-news.jpg",
    author: "Leonardo da Vinci",
    date: "June 15, 2023",
    category: "CBDCs",
    readTime: "5 min read"
  }
];

export default function NewsDetail() {
  const router = useRouter();
  const params = useParams();
  const [bookmarked, setBookmarked] = useState(false);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (params && params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const foundNews = newsItems.find(item => item.id === id);
      
      if (foundNews) {
        setNewsItem(foundNews);
      } else {
        router.push('/news');
      }
    }
  }, [params, router]);

  const getCategoryColor = (category: string) => {
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

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-[#21232d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const paragraphs = newsItem.content.split('\n\n');

  return (
    <div className="min-h-screen bg-[#21232d]">
      {/* Header */}
      <header className="hidden">
        <div className="flex items-center">
          <button 
            className="text-white cursor-pointer p-2 mr-2 hover:bg-[#272b3b] rounded-full transition-colors" 
            onClick={() => router.push('/news')}
          >
            <HiArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold">Article Details</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            className="p-2 hover:bg-[#272b3b] rounded-full transition-colors"
            onClick={() => setBookmarked(!bookmarked)}
          >
            {bookmarked ? 
              <FaBookmark className="text-blue-500" size={18} /> : 
              <FaRegBookmark className="text-gray-400" size={18} />
            }
          </button>
          
          <button className="p-2 hover:bg-[#272b3b] rounded-full transition-colors">
            <FaShare className="text-gray-400" size={18} />
          </button>
        </div>
      </header>
      
      {/* Article Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Back button */}
        <button 
          className="text-white mb-6 flex items-center hover:text-blue-400 transition-colors"
          onClick={() => router.push('/news')}
        >
          <HiArrowLeft size={20} className="mr-2" />
          <span>Back to News</span>
        </button>
        
        {/* Category Badge */}
        <div className="mb-4">
          <span className={`${getCategoryColor(newsItem.category)} text-white text-xs px-3 py-1 rounded-md font-medium`}>
            {newsItem.category}
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-4">{newsItem.title}</h1>
        
        {/* Date and Read Time */}
        <div className="flex items-center space-x-4 mb-6 text-gray-400 text-sm">
          <span>{newsItem.date}</span>
          <span>•</span>
          <span>{newsItem.readTime}</span>
        </div>
        
        {/* Author */}
        <div className="flex items-center space-x-3 mb-8 border-b border-[#272b3b] pb-6">
          <div className={`w-10 h-10 ${newsItem.author === "Efe Turgut" ? 'bg-purple-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-medium`}>
            {newsItem.author.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{newsItem.author}</p>
            <p className="text-gray-400 text-xs">{newsItem.author === "Efe Turgut" ? 'Editor' : 'Contributor'}</p>
          </div>
          
          <div className="ml-auto flex space-x-3">
            <button 
              className="p-2 hover:bg-[#272b3b] rounded-full transition-colors"
              onClick={() => setBookmarked(!bookmarked)}
            >
              {bookmarked ? 
                <FaBookmark className="text-blue-500" size={18} /> : 
                <FaRegBookmark className="text-gray-400" size={18} />
              }
            </button>
            
            <button className="p-2 hover:bg-[#272b3b] rounded-full transition-colors">
              <FaShare className="text-gray-400" size={18} />
            </button>
          </div>
        </div>
        
        {/* Article Hero Image */}
        <div className={`${getCategoryColor(newsItem.category)} bg-opacity-10 rounded-xl h-64 mb-8 flex items-center justify-center`}>
          <div className={`w-24 h-24 ${getCategoryColor(newsItem.category)} rounded-full flex items-center justify-center`}>
            {newsItem.category === 'Bitcoin' && (
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.4s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
              </svg>
            )}
            {newsItem.category === 'Ethereum' && (
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
            )}
            {!['Bitcoin', 'Ethereum'].includes(newsItem.category) && (
              <div className="text-white font-bold text-2xl">
                {newsItem.category.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        {/* Article Content */}
        <div className="space-y-5">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Tags */}
        <div className="mt-10 pt-6 border-t border-[#272b3b]">
          <p className="text-gray-400 mb-3">Related Topics</p>
          <div className="flex flex-wrap gap-2">
            <span className={`${getCategoryColor(newsItem.category)} bg-opacity-20 text-gray-300 text-xs px-3 py-1 rounded-full`}>
              {newsItem.category}
            </span>
            <span className="bg-[#272b3b] text-gray-300 text-xs px-3 py-1 rounded-full">
              Cryptocurrency
            </span>
            <span className="bg-[#272b3b] text-gray-300 text-xs px-3 py-1 rounded-full">
              Digital Assets
            </span>
            <span className="bg-[#272b3b] text-gray-300 text-xs px-3 py-1 rounded-full">
              Blockchain
            </span>
          </div>
        </div>
        
        {/* Related Articles */}
        <div className="mt-10">
          <h3 className="text-white text-xl font-bold mb-4">Related Articles</h3>
          <div className="grid grid-cols-2 gap-4">
            {newsItems
              .filter(item => item.id !== newsItem.id && item.category === newsItem.category)
              .slice(0, 2)
              .map(item => (
                <div 
                  key={item.id} 
                  className="bg-[#121319] rounded-xl p-4 cursor-pointer hover:bg-[#1a1b23] transition-colors"
                  onClick={() => {
                    router.push(`/news/${item.id}`);
                  }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 ${getCategoryColor(item.category)} rounded-full flex items-center justify-center`}>
                      {item.category === 'Bitcoin' && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z"/>
                        </svg>
                      )}
                      {item.category === 'Ethereum' && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003z"/>
                        </svg>
                      )}
                      {!['Bitcoin', 'Ethereum'].includes(item.category) && (
                        <div className="text-white font-bold text-xs">
                          {item.category.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">{item.date} • {item.readTime}</span>
                  </div>
                  <h4 className="text-white text-sm font-medium line-clamp-2">{item.title}</h4>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 