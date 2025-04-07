import React from 'react';
import { FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
        <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${isUser ? 'ml-3 mr-0 bg-gradient-to-br from-blue-500 to-blue-600' : 'mr-3 overflow-hidden'} shadow-md`}>
          {isUser ? 
            <FaUser size={15} className="text-white" /> : 
            <Image src="/QAI bot.jpeg" alt="QAI Assistant" width={36} height={36} className="w-full h-full object-cover" />
          }
        </div>
        
        <div 
          className={`p-4 rounded-2xl shadow-md ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm' 
              : 'bg-[#1E2030] text-white border border-gray-700/30 rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          ) : (
            <div className="text-sm leading-relaxed markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (props) => <h1 className="text-xl font-bold my-3" {...props} />,
                  h2: (props) => <h2 className="text-lg font-bold my-2" {...props} />,
                  h3: (props) => <h3 className="text-md font-bold my-2" {...props} />,
                  p: (props) => <p className="my-2" {...props} />,
                  ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  li: (props) => <li className="my-1" {...props} />,
                  strong: (props) => <strong className="font-bold" {...props} />,
                  em: (props) => <em className="italic" {...props} />,
                  a: (props) => <a className="text-blue-400 hover:underline" {...props} />,
                  blockquote: (props) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic" {...props} />
                  ),
                  code: ({ inline, className, children, ...props }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return inline ? 
                      <code className="bg-gray-700 px-1 rounded" {...props}>{children}</code> : 
                      <code className={`block bg-gray-700 p-2 rounded my-2 overflow-x-auto ${match ? `language-${match[1]}` : ''}`} {...props}>
                        {children}
                      </code>
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          <div className="text-xs text-gray-300 mt-1.5 opacity-60 text-right">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 