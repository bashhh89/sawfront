'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = ({ isExpanded, toggleSidebar }) => {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/knowledge', icon: '📚', label: 'Knowledge', description: 'Repository' },
    { href: '/clients', icon: '👥', label: 'Clients', description: 'Profiles' },
    { href: '/sow', icon: '📄', label: 'SOW', description: 'Generator' },
    { href: '/innovation', icon: '💡', label: 'Innovation', description: 'Services' },
  ];

  const getLinkClass = (path) => {
    const isActive = pathname === path;
    
    if (isExpanded) {
      return `group flex items-center w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 mb-2 ${
        isActive 
          ? 'bg-primary text-white shadow-lg transform scale-105' 
          : 'text-gray-700 hover:bg-white hover:shadow-md hover:text-primary'
      }`;
    } else {
      return `group flex justify-center items-center w-full py-3 px-2 rounded-xl font-medium transition-all duration-200 mb-2 ${
        isActive 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-gray-700 hover:bg-white hover:shadow-md hover:text-primary'
      }`;
    }
  };  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl transition-all duration-300 z-40 ${isExpanded ? 'w-72' : 'w-20'} border-r border-gray-200`}>
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 bg-white border-2 border-gray-200 text-primary p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-primary hover:text-white transition-all duration-200 transform hover:scale-110"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Sidebar Content */}
      <div className="p-6 pt-12 h-full overflow-y-auto">
        {/* Logo/Brand Section */}
        {isExpanded && (
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SG</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Social Garden</h2>
                <p className="text-xs text-gray-500">AI Platform</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              <div className="flex items-center w-full">
                <span className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                {isExpanded && (
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* Bottom Section */}
        {isExpanded && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Assistant Active</p>
                  <p className="text-xs text-gray-500">Ready to help</p>
                </div>
              </div>
            </div>
          </div>
        )}      </div>
    </aside>
  );
};

export default Navigation;
