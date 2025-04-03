'use client';
import { HiBell, HiSearch} from 'react-icons/hi';
import { IoMailOutline } from 'react-icons/io5';

export default function Settings() {

  return (
    <div className="min-h-screen bg-[#21232d]">
      {/* Header */}
      <header className="bg-[#21232d] p-5 flex items-center justify-between border-b border-[#272b3b]">
        <div className="flex items-center">
          <h1 className="text-white text-2xl font-bold">Setting</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#121319] text-gray-300 rounded-xl py-2 pl-10 pr-4 w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm border border-[#272b3b]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="text-gray-400" size={16} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-[#272b3b] rounded-[10px] relative">
            <HiBell className="text-gray-400" size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-[10px]"></div>
            <div className="text-white">
              <span className="text-base">Wizard Labs</span>
              <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-6 space-y-6">
        {/* User Profile Section */}
        <div className="bg-[#121319] rounded-lg p-5">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ET</span>
            </div>
            
            <div className="ml-6">
              <h2 className="text-white text-2xl font-bold">Evren Turgut</h2>
              <p className="text-gray-400">evrenturgut@thwizardlabs.com</p>
            </div>
            
            <button className="ml-auto bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Edit
            </button>
          </div>
        </div>
        
        {/* Form Sections */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-[#121319] rounded-lg p-5">
            <h3 className="text-white text-lg font-bold mb-5">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-gray-400 text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Your Full Name"
                  className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-gray-400 text-sm mb-1">Company</label>
                <input
                  type="text"
                  id="company"
                  placeholder="Your Company"
                  className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-gray-400 text-sm mb-1">Country</label>
                <input
                  type="text"
                  id="country"
                  placeholder="Your Country"
                  className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">My email Address</label>
                <div className="flex items-center p-4 bg-[#21232d] border border-[#272b3b] rounded-lg">
                  <div className="mr-4">
                    <IoMailOutline className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-white">evrenturgut@thwizardlabs.com</p>
                    <p className="text-gray-400 text-xs">2 years ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-[#121319] rounded-lg p-5">
              <h3 className="text-white text-lg font-bold mb-5">Account Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="nickName" className="block text-gray-400 text-sm mb-1">Nick Name</label>
                  <input
                    type="text"
                    id="nickName"
                    placeholder="Your Nick Name"
                    className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="identificationId" className="block text-gray-400 text-sm mb-1">Identification Id</label>
                  <input
                    type="text"
                    id="identificationId"
                    placeholder="Your Identification Id"
                    className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-gray-400 text-sm mb-1">Adress</label>
                  <input
                    type="text"
                    id="address"
                    placeholder="Your Address"
                    className="w-full bg-[#21232d] border border-[#272b3b] rounded-lg py-3 px-4 text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[#121319] rounded-lg p-5">
              <h3 className="text-white text-lg font-bold mb-5">Payment Methods</h3>
              
              <button className="bg-blue-500 bg-opacity-20 text-blue-500 w-full py-3 rounded-lg text-sm mb-4">
                Credit Cart
              </button>
              
              {/* Credit Card Design */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-700 rounded-full -mr-16 -mt-16 opacity-20"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="text-gray-400 text-sm">debit</div>
                  <div className="flex items-center justify-center w-10 h-6 rounded bg-yellow-400 opacity-90"></div>
                </div>
                
                <div className="text-white text-xl font-mono tracking-wider mb-6">
                  3475 7381 3759 4512
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-gray-300 text-xs uppercase">HASAN TALHA GÜZELLER</div>
                  <div className="text-white font-bold text-xl">VISA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
