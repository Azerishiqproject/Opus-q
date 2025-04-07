'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiRipple, SiBinance, SiDogecoin, SiPolkadot, SiCardano } from 'react-icons/si';
import { HiMenuAlt2 } from 'react-icons/hi';
import { IoBook, IoArrowUp } from 'react-icons/io5';
import Image from 'next/image';
import Portfolio from '@/components/Portfolio';
import { SidebarContext } from '@/app/ClientLayout';
import { IconType } from 'react-icons';
import { useGetCoinsQuery } from '@/redux/services/coinApi';
import MiniChart from '@/components/MiniChart';
import ChatMessage, { Message } from '@/components/ChatMessage';
import { sendMessageToGemini, formatMessagesForGemini } from '@/services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface CryptoCardProps {
  icon: IconType | React.ReactNode;
  bgColor: string;
  name: string;
  symbol: string;
  price: string;
  amount: string;
  trend: 'up' | 'down';
  priceChangePercentage: number;
  chartData: number[];
  id: string;
}

const QAIPage = () => {
  const { toggleSidebar, isSidebarOpen } = useContext(SidebarContext);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [cryptoCards, setCryptoCards] = useState<CryptoCardProps[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // API'dan verileri çekme
  const { data: coins, error, isLoading: isCoinsLoading } = useGetCoinsQuery();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isChatMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatMode]);

  // Kripto coin iconu seçmek için helper fonksiyon
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
      case 'doge':
        return SiDogecoin;
      case 'dot':
        return SiPolkadot;
      case 'ada':
        return SiCardano;
      default:
        // Give the component a name instead of using an anonymous function
        const DefaultCoinIcon = () => <span className="text-white font-bold text-lg">{symbol.charAt(0).toUpperCase()}</span>;
        DefaultCoinIcon.displayName = `DefaultCoinIcon-${symbol}`;
        return DefaultCoinIcon;
    }
  };

  // Arkaplan rengi seçmek için helper fonksiyon
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
      case 'doge':
        return "#c3a634";
      case 'dot':
        return "#e6007a";
      case 'ada':
        return "#0033ad";
      default:
        return "#" + Math.floor(Math.random() * 16777215).toString(16); // Rastgele renk
    }
  };

  // API verilerini alınca kart verilerini güncelleme
  useEffect(() => {
    if (coins && coins.length > 0) {
      const mappedCoins = coins.slice(0, 6).map(coin => {
        const priceChangePercentage = coin.price_change_percentage_24h;
        // tip sorunu yaşamamak için kesin 'up' veya 'down' atama
        const trend: 'up' | 'down' = priceChangePercentage >= 0 ? 'up' : 'down';
        
        // Fiyat verisi için sahte grafik verisi oluştur
        const priceData = Array.from({ length: 24 }, (_, i) => {
          // Coin değerine göre rasgele değişimler oluştur
          const baseValue = coin.current_price;
          const volatility = baseValue * 0.02; // %2 volatilite
          const randomChange = (Math.random() - 0.5) * volatility;
          // Trending yönünü belirle
          const trendMultiplier = trend === 'up' ? 1 : -1;
          // Trendi de ekleyerek gerçekçi veri oluştur
          return baseValue + randomChange + (trendMultiplier * volatility * (i / 24));
        });

        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: getCoinIcon(coin.symbol),
          bgColor: getCoinColor(coin.symbol),
          price: `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          amount: `${(Math.random() * 2 + 0.1).toFixed(3)} ${coin.symbol.toUpperCase()}`,
          trend,
          priceChangePercentage,
          chartData: priceData
        };
      });
      
      setCryptoCards(mappedCoins);
    }
  }, [coins]);

  const handleTogglePortfolio = () => {
    // Eğer Portfolio açılacaksa ve sidebar açıksa, sidebar'ı kapat
    if (!isPortfolioOpen && isSidebarOpen) {
      toggleSidebar(); // Sidebar'ı kapat
    }
    
    setIsPortfolioOpen(!isPortfolioOpen);
  };

  const handleToggleSidebar = () => {
    // Eğer sidebar açılacaksa ve portfolio açıksa, portfolio'yu kapat
    if (!isSidebarOpen && isPortfolioOpen) {
      setIsPortfolioOpen(false);
    }
    
    toggleSidebar();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (!isChatMode) {
        // İlk defa chat modu açılıyorsa, hoşgeldin mesajı ekle
        setMessages([
          {
            id: uuidv4(),
            content: "Merhaba! Ben QAI, kripto para ve finansla ilgili sorularınıza yardımcı olmak için buradayım. Size nasıl yardımcı olabilirim?",
            role: 'assistant' as const,
            timestamp: new Date()
          }
        ]);
        setIsChatMode(true);
        
        // Kullanıcının ilk mesajını ekle ve cevap al
        setTimeout(() => {
          const userMessage: Message = {
            id: uuidv4(),
            content: searchInput,
            role: 'user' as const,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);
          handleSendMessage(searchInput);
        }, 500);
      } else {
        // Zaten chat modundaysa, doğrudan mesaj gönder
        const userMessage: Message = {
          id: uuidv4(),
          content: searchInput,
          role: 'user' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        handleSendMessage(searchInput);
      }
      setSearchInput('');
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Prepare conversation history for API
      const conversationHistory = messages
        .slice(-10) // Only use last 10 messages to avoid token limits
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add the new user message
      conversationHistory.push({
        role: 'user' as const,
        content: messageContent
      });
      
      // Format for Gemini API
      const formattedMessages = formatMessagesForGemini(conversationHistory);
      
      // Get response from Gemini
      const response = await sendMessageToGemini(formattedMessages);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat modundan çıkma değil, yeni sohbet başlatma
  const handleExitChat = () => {
    // Sohbeti sıfırla ama chat modunda kal
    setMessages([
      {
        id: uuidv4(),
        content: "# Merhaba! 👋\n\nBen **Opus**, kripto para ve finans danışmanınız. Size şu konularda yardımcı olabilirim:\n\n- Kripto paralar ve blockchain teknolojisi hakkında bilgiler\n- DeFi, NFT ve Web3 projeleri hakkında açıklamalar\n- Finans terimleri ve yatırım kavramları\n- Piyasa analizleri ve güncel trendler\n\nLütfen kripto para veya finans ile ilgili sorularınızı sorun. Size en doğru ve güncel bilgileri sunmaya hazırım!",
        role: 'assistant' as const,
        timestamp: new Date()
      }
    ]);
  };

  // API tarafından güncellenen header ticker verileri
  const tickerCoins = coins ? [
    { symbol: 'BTC/USD', change: coins[0]?.price_change_percentage_24h, price: coins[0]?.current_price },
    { symbol: 'ETH/USD', change: coins[1]?.price_change_percentage_24h, price: coins[1]?.current_price },
    { symbol: 'BNB/USD', change: coins[2]?.price_change_percentage_24h, price: coins[2]?.current_price },
    { symbol: 'XRP/USD', change: coins[3]?.price_change_percentage_24h, price: coins[3]?.current_price }
  ] : [];

  return (
    <div className="flex flex-col h-screen bg-[#21232d] text-white">
      {/* Portfolio - using transform for animation */}
      <div className={`fixed top-0 right-0 h-full w-[320px] transform transition-transform duration-300 ease-in-out z-30 ${isPortfolioOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Portfolio 
          isOpen={isPortfolioOpen} 
          onClose={() => setIsPortfolioOpen(false)}
        />
      </div>

      {/* Main Content Container */}
      <div 
        className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${
          isPortfolioOpen ? 'w-[calc(100%_-_320px)]' : 'w-full'
        }`}
        style={{
          marginRight: isPortfolioOpen ? '320px' : '0'
        }}
      >
        {/* Header with ticker */}
        <header className="flex items-center justify-between py-3 px-4 border-b border-gray-700 bg-[#21232d] sticky top-0 z-10">
          <button className="text-white cursor-pointer" onClick={handleToggleSidebar}>
            <HiMenuAlt2 size={24} />
          </button>
          
          <div className="flex items-center space-x-6 overflow-x-auto text-sm scrollbar-hide">
            {isCoinsLoading ? (
              <div className="flex space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center whitespace-nowrap animate-pulse">
                    <div className="w-16 h-3 bg-gray-700 rounded"></div>
                    <div className="ml-2 w-8 h-3 bg-gray-700 rounded"></div>
                    <div className="ml-1 w-12 h-3 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">Veri alınamadı</div>
            ) : (
              tickerCoins.map((ticker, index) => (
                <div key={index} className="flex items-center whitespace-nowrap">
                  <span>{ticker.symbol}</span>
                  <span className={`ml-2 ${ticker.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {ticker.change >= 0 ? '+' : ''}{ticker.change?.toFixed(2)}%
                  </span>
                  <span className="ml-1 text-gray-400">{ticker.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              ))
            )}
          </div>
          
          <button 
            className={`text-white cursor-pointer p-2 rounded-full transition-colors ${isPortfolioOpen ? 'bg-blue-600/20 text-blue-500' : 'hover:bg-[#272b3b]'}`} 
            onClick={handleTogglePortfolio}
          >
            <IoBook size={22} />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <h1 className="text-3xl font-bold text-center mb-8">QAI Assistant</h1>
            
            {isChatMode ? (
              <div className="max-w-4xl mx-auto w-full">
                {/* Chat header with exit button */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center mr-3">
                      <Image src="/QAI bot.jpeg" alt="QAI Assistant" width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Sohbet Asistanı</h2>
                  </div>
                  <button
                    onClick={handleExitChat}
                    className="bg-[#1a1c25] text-gray-400 hover:text-white py-1.5 px-4 rounded-lg text-sm flex items-center transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Yeni Sohbet
                  </button>
                </div>
                
                {/* Chat messages */}
                <div className="px-2 pb-4 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {messages.map(message => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden flex items-center justify-center mr-3 shadow-md">
                          <Image src="/QAI bot.jpeg" alt="QAI Assistant" width={36} height={36} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-[#1E2030] text-white p-4 rounded-2xl shadow-md border border-gray-700/30 rounded-bl-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto w-full">
                {isCoinsLoading ? (
                  // Loading state
                  [...Array(6)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#121319] p-4 rounded-xl animate-pulse">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        </div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-10"></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-3 w-20 h-8 bg-gray-700 rounded"></div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-2 text-center text-red-500">
                    <p>Kripto para verileri alınırken bir hata oluştu.</p>
                    <p className="text-sm">Lütfen daha sonra tekrar deneyin.</p>
                  </div>
                ) : (
                  cryptoCards.map((crypto, index) => {
                    const Icon = crypto.icon as IconType;
                    return (
                      <div key={index} className="flex items-center justify-between bg-[#121319] p-4 rounded-xl">
                        <div className="flex items-center flex-1">
                          <div className="mr-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: crypto.bgColor }}>
                              {typeof crypto.icon === 'function' ? (
                                <Icon size={20} className="text-white" />
                              ) : (
                                crypto.icon
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{crypto.name}</h3>
                            <p className="text-gray-400 text-xs">{crypto.symbol}</p>
                          </div>
                        </div>
                        <div className="flex items-center flex-1 justify-end">
                          <div className="mr-4 w-24 h-8 flex justify-end">
                            <MiniChart 
                              coinId={crypto.id}
                              isPositive={crypto.trend === 'up'}
                              width={96} 
                              height={32}
                            />
                          </div>
                          <div className="text-right min-w-[90px]">
                            <h3 className="font-bold text-base">{crypto.price}</h3>
                            <p className={`text-xs ${crypto.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                              {crypto.trend === 'up' ? '+' : ''}{crypto.priceChangePercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Search bar at bottom */}
          <div className="flex justify-center mt-6">
            <form onSubmit={handleSearchSubmit} className="w-11/12 max-w-lg">
              <div className={`bg-[#121319] border ${isChatMode ? 'border-blue-600/50' : 'border-[#272b3b]'} rounded-full flex items-center p-1.5 px-4 ${isChatMode ? 'shadow-[0_0_10px_rgba(37,99,235,0.1)]' : ''}`}>
                <input 
                  type="text" 
                  className="w-full bg-transparent text-gray-300 outline-none text-sm" 
                  placeholder={isChatMode ? "Mesajınızı yazın..." : "Ask me anything..."} 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className={`${isChatMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#272b3b]'} rounded-full cursor-pointer p-2 transition-colors`}
                >
                  <IoArrowUp size={18} />
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

QAIPage.displayName = 'QAIPage';

export default QAIPage;
