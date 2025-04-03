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
    content: "Bitcoin has experienced a significant price increase, reaching a new high for the year. The surge is attributed to growing institutional interest, with major financial firms increasing their Bitcoin holdings. Analysts suggest that the approval of spot Bitcoin ETFs and global economic uncertainty have contributed to the rise.\n\nThe world's largest cryptocurrency by market capitalization has seen renewed interest from institutional investors who previously remained on the sidelines. Major investment firms have been allocating portions of their portfolios to Bitcoin as a hedge against inflation and currency devaluation.\n\nRegulatory developments have also played a crucial role in this rally. The SEC's approval of spot Bitcoin ETFs has been viewed as a significant step towards mainstream acceptance of cryptocurrencies. These investment vehicles allow traditional investors to gain exposure to Bitcoin without directly holding the asset.\n\nMarket analysts are divided on the sustainability of this rally. Some believe that Bitcoin could reach new all-time highs in the coming months, citing increasing adoption and limited supply. Others warn of potential volatility, pointing to historical patterns of sharp corrections following rapid price increases.\n\nDespite the debate, the current price action reflects growing confidence in Bitcoin's role in the global financial ecosystem. As more institutions enter the space, the cryptocurrency's volatility may decrease, potentially making it more attractive to conservative investors.",
    image: "/bitcoin-news.jpg",
    author: "Efe Turgut",
    date: "May 31, 2023",
    category: "Bitcoin",
    readTime: "5 min read"
  },
  {
    id: 'news-2',
    title: "Ethereum's Shanghai Upgrade Set to Transform the Network",
    content: "Ethereum's upcoming Shanghai upgrade is expected to bring significant changes to the network, including enabling staked ETH withdrawals. This long-awaited feature will allow validators to access their staked ETH and rewards, potentially increasing participation in Ethereum's proof-of-stake consensus mechanism.\n\nThe Shanghai upgrade represents one of the most significant technical milestones for Ethereum since its transition to proof-of-stake. Validators who have staked their ETH to secure the network will finally be able to withdraw their tokens, addressing a major concern that has existed since the Merge.\n\nBeyond staking withdrawals, the upgrade includes several Ethereum Improvement Proposals (EIPs) aimed at optimizing gas costs for various operations. These optimizations are expected to make the network more efficient and potentially reduce transaction fees for users.\n\nThe development team has been conducting extensive testing on test networks to ensure a smooth transition. The upgrade has already been successfully implemented on multiple testnets, with the mainnet implementation scheduled in the coming weeks.\n\nMarket analysts are closely watching how this upgrade might affect ETH's price and market dynamics. Some speculate that enabling withdrawals could lead to selling pressure in the short term, while others argue that the reduced risk of staking will attract more participants and increase demand for ETH in the long run.",
    image: "/ethereum-news.jpg",
    author: "Hasan Güzeller",
    date: "June 2, 2023",
    category: "Ethereum",
    readTime: "6 min read"
  },
  {
    id: 'news-3',
    title: "Regulatory Clarity Emerges for Cryptocurrencies in Europe",
    content: "European regulators have introduced a new framework for cryptocurrency regulation, providing much-needed clarity for businesses and investors. The new rules establish guidelines for crypto asset service providers and aim to protect consumers while fostering innovation in the blockchain space.\n\nThe Markets in Crypto-Assets (MiCA) regulation represents a comprehensive approach to cryptocurrency oversight in the European Union. The framework creates a standardized set of rules across all member states, eliminating the fragmented regulatory landscape that has complicated operations for crypto businesses.\n\nKey aspects of the regulation include licensing requirements for crypto service providers, capital requirements, and consumer protection measures. The framework also addresses environmental concerns by requiring transparency regarding the energy consumption and environmental impact of crypto assets.\n\nIndustry participants have generally welcomed the regulatory clarity, with many suggesting that clear rules will encourage institutional investment and mainstream adoption. Some concerns remain about the compliance burden for smaller startups, but provisions have been included to provide proportional requirements based on company size.\n\nThe European approach contrasts with more fragmented regulatory environments in other regions, potentially positioning Europe as a leader in crypto innovation while maintaining consumer protections. Other jurisdictions are watching closely, with some considering similar frameworks for their markets.",
    image: "/regulation-news.jpg",
    author: "Efe Turgut",
    date: "June 5, 2023",
    category: "Regulation",
    readTime: "5 min read"
  },
  {
    id: 'news-4',
    title: "DeFi Projects See Surge in Total Value Locked",
    content: "Decentralized finance (DeFi) protocols have experienced a significant increase in total value locked (TVL) over the past month. This growth suggests renewed confidence in the DeFi sector, with investors seeking alternatives to traditional financial services amidst global banking concerns.\n\nThe recent banking crisis has highlighted the vulnerabilities in traditional finance, driving interest in decentralized alternatives. DeFi platforms offering lending, borrowing, and trading services have seen substantial inflows, with total value locked increasing by over 30% in just four weeks.\n\nLeading this resurgence are Layer 2 solutions built on Ethereum, which offer reduced transaction costs while maintaining security. Protocols built on these scaling solutions have seen particularly strong growth as users become more comfortable with the technology.\n\nYield opportunities in DeFi have also become more attractive compared to traditional finance. With many DeFi protocols offering yields significantly higher than traditional savings accounts, investors looking for returns in a challenging economic environment have turned to these platforms.\n\nDespite the positive momentum, analysts caution that regulatory uncertainty remains a significant risk factor for the sector. Recent regulatory actions against certain centralized crypto companies have raised questions about potential implications for DeFi protocols, particularly those with more centralized governance structures.",
    image: "/defi-news.jpg",
    author: "Hasan Güzeller",
    date: "June 8, 2023",
    category: "DeFi",
    readTime: "5 min read"
  },
  {
    id: 'news-5',
    title: "NFT Market Shows Signs of Recovery After Year-Long Slump",
    content: "The non-fungible token (NFT) market is showing signs of recovery after a prolonged downturn. Trading volumes have increased, and new projects are attracting attention. Experts attribute this revival to innovations in utility-focused NFTs and increased integration with gaming and metaverse platforms.\n\nAfter reaching peak trading volumes in 2021 and early 2022, the NFT market experienced a significant correction, with prices and trading activity declining sharply. However, recent data indicates a potential turnaround, with trading volumes increasing for the first time in several quarters.\n\nThis revival appears to be driven by a shift in the market toward utility-focused NFTs rather than purely speculative art pieces. Projects offering tangible benefits, such as access to exclusive communities, real-world events, or in-game advantages, are seeing the strongest growth.\n\nGaming and metaverse applications continue to be the most promising use cases for NFTs. Major game developers are increasingly incorporating NFT technology, allowing players to truly own their in-game assets and potentially transfer them between compatible games.\n\nInstitutional interest has also contributed to the market's recovery. Major brands continue to experiment with NFTs for customer engagement and loyalty programs, bringing mainstream attention and new users to the space.",
    image: "/nft-news.jpg",
    author: "Efe Turgut",
    date: "June 12, 2023",
    category: "NFTs",
    readTime: "4 min read"
  },
  {
    id: 'news-6',
    title: "Central Banks Accelerate CBDC Development Worldwide",
    content: "Central banks around the world are accelerating their research and development of Central Bank Digital Currencies (CBDCs). This trend reflects growing recognition of the importance of digital assets in the future of finance, with several major economies planning pilot programs in the coming months.\n\nThe pace of CBDC development has increased significantly over the past year, with over 80% of central banks now actively researching or developing digital currencies. China continues to lead with its Digital Yuan, which has already been tested by millions of users across multiple cities.\n\nThe European Central Bank has intensified its work on a digital euro, moving from research to a more active development phase. Similarly, the Federal Reserve in the United States has expanded its research efforts, although it maintains a more cautious approach compared to other major economies.\n\nMotivations for CBDC development vary across countries but commonly include enhancing payment system efficiency, promoting financial inclusion, and maintaining monetary sovereignty in an increasingly digital world. Some central banks also view CBDCs as a way to counter the growing influence of private cryptocurrencies and stablecoins.\n\nConcerns about privacy, security, and potential disruption to existing banking systems remain significant challenges. Central banks are exploring various technological approaches and governance structures to address these concerns while delivering the benefits of digital currencies.",
    image: "/cbdc-news.jpg",
    author: "Hasan Güzeller",
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