'use client';

import { useState } from 'react';

interface SidebarProps {
  onSectionChange: (section: string) => void;
  activeSection: string;
}

export default function Sidebar({ onSectionChange, activeSection }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-700 flex items-center justify-between`}>
        {!isCollapsed && <h1 className="text-xl font-bold">C4 Architecture</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onSectionChange('C2')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-colors ${
                activeSection === 'C2'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={isCollapsed ? 'C2' : ''}
            >
              <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!isCollapsed && <span>C2</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onSectionChange('DD')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-colors ${
                activeSection === 'DD'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={isCollapsed ? 'DD' : ''}
            >
              <svg className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              {!isCollapsed && <span>DD</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Powered by Tailwind CSS v4
          </p>
        </div>
      )}
    </div>
  );
} 