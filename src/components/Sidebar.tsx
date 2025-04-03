'use client';

import { FC } from 'react';
import { FiGrid, FiMessageCircle, FiRepeat, FiSettings, FiLogOut} from 'react-icons/fi';
import { FiCreditCard } from 'react-icons/fi';
import { FiFileText } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  
  return (
    <div 
      className={`fixed top-0 left-0 h-full w-[230px] bg-[#121319] text-white flex flex-col shrink-0 z-30 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo and close button */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <h1 className="text-xl font-bold ml-2">Opus-Q</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <ul>
          <li className="mb-2">
            <Link 
              href="/dashboard" 
              className={`flex items-center py-3 px-6 ${pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiGrid className="mr-3" size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/qai" 
              className={`flex items-center py-3 px-6 ${pathname === '/qai' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiMessageCircle className="mr-3" size={20} />
              <span>QAI</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/transactions" 
              className={`flex items-center py-3 px-6 ${pathname === '/transactions' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiRepeat className="mr-3" size={20} />
              <span>Transactions</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/wallet" 
              className={`flex items-center py-3 px-6 ${pathname === '/wallet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiCreditCard className="mr-3" size={20} />
              <span>Wallet</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/news" 
              className={`flex items-center py-3 px-6 ${pathname === '/news' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiFileText className="mr-3" size={20} />
              <span>News</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto mb-6">
        <ul>
          <li className="mb-2">
            <Link 
              href="/settings" 
              className={`flex items-center py-3 px-6 ${pathname === '/settings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiSettings className="mr-3" size={20} />
              <span>Setting</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/logout" 
              className={`flex items-center py-3 px-6 ${pathname === '/logout' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FiLogOut className="mr-3" size={20} />
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 