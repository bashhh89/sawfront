import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md bg-opacity-95 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg mr-3">
            <Image src="/Logo-Dark-Green.svg" alt="Social Garden" width={24} height={24} priority className="filter brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">AI Knowledge Base</h1>
            <p className="text-xs text-gray-500">Social Garden Intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-accent-light bg-opacity-20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm text-accent font-medium">Connected</span>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
