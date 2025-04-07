import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IoArrowUp, IoClose } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import Image from 'next/image';
import ChatMessage, { Message } from './ChatMessage';
import { sendMessageToGemini, formatMessagesForGemini } from '@/services/geminiService';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessedRef = useRef(false);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          content: "# Merhaba! 👋\n\nBen **Opus**, kripto para ve finans danışmanınız. Size şu konularda yardımcı olabilirim:\n\n- Kripto paralar ve blockchain teknolojisi hakkında bilgiler\n- DeFi, NFT ve Web3 projeleri hakkında açıklamalar\n- Finans terimleri ve yatırım kavramları\n- Piyasa analizleri ve güncel trendler\n\nLütfen kripto para veya finans ile ilgili sorularınızı sorun. Size en doğru ve güncel bilgileri sunmaya hazırım!",
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
      
      // Reset the initialMessageProcessed flag when opening a new chat
      initialMessageProcessedRef.current = false;
    }
  }, [isOpen, messages.length]);
  
  // Process initial message separately
  useEffect(() => {
    // Only process if chat is open, there's an initial message, and it hasn't been processed yet
    if (isOpen && initialMessage && initialMessage.trim() && !initialMessageProcessedRef.current && messages.length > 0) {
      const userMessage: Message = {
        id: uuidv4(),
        content: initialMessage,
        role: 'user',
        timestamp: new Date()
      };
      
      // Mark as processed immediately to prevent duplicate execution
      initialMessageProcessedRef.current = true;
      
      setTimeout(() => {
        setMessages(prev => [...prev, userMessage]);
        handleSendMessage(initialMessage);
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMessage, messages.length]);

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
        role: 'user',
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
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    
    // Send message to API
    await handleSendMessage(currentInput);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-[60vh] bg-[#121319] rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1c25] to-[#242736] py-3 px-4 flex items-center justify-between border-b border-gray-700 shadow-md">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center mr-3 shadow-lg">
            <Image src="/QAI bot.jpeg" alt="QAI Assistant" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Opus Kripto Asistanı</h2>
            <p className="text-xs text-gray-400">Finans ve kripto para danışmanınız</p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => {
              setMessages([
                {
                  id: uuidv4(),
                  content: "# Merhaba! 👋\n\nBen **Opus**, kripto para ve finans danışmanınız. Size şu konularda yardımcı olabilirim:\n\n- Kripto paralar ve blockchain teknolojisi hakkında bilgiler\n- DeFi, NFT ve Web3 projeleri hakkında açıklamalar\n- Finans terimleri ve yatırım kavramları\n- Piyasa analizleri ve güncel trendler\n\nLütfen kripto para veya finans ile ilgili sorularınızı sorun. Size en doğru ve güncel bilgileri sunmaya hazırım!",
                  role: 'assistant',
                  timestamp: new Date()
                }
              ]);
              initialMessageProcessedRef.current = false;
            }}
            className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 px-3 py-1.5 mr-3 rounded-md transition-colors text-sm flex items-center border border-blue-700/30"
          >
            <IoMdRefresh className="mr-1.5" size={16} />
            Yeni Sohbet
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#272b3b] transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center mr-3">
                  <Image src="/QAI bot.jpeg" alt="QAI Assistant" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="bg-[#272b3b] text-white p-3 rounded-lg flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-gray-700 bg-[#1a1c25]">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kripto veya finans ile ilgili bir soru sorun..."
              className="flex-1 bg-[#272b3b] text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-r-lg flex items-center justify-center shadow-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800 transition-colors'
              }`}
              disabled={isLoading}
            >
              <IoArrowUp size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add display name for ESLint rule
ChatInterface.displayName = 'ChatInterface';

export default ChatInterface; 