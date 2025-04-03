'use client';

import { useState, createContext, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

// Create context for sidebar state
export const SidebarContext = createContext({
  isSidebarOpen: true,
  toggleSidebar: () => {},
});

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isSidebarOpen ? "ml-[230px]" : "ml-0"
          }`}
        >
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
} 