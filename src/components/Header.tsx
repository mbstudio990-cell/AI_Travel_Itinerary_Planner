import React from 'react';
import { Plane, Save } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onViewSaved: () => void;
  savedCount: number;
}

const Header: React.FC<HeaderProps> = ({ onViewSaved, savedCount }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderAI
              </h1>
              <p className="text-sm text-gray-500">
                Your AI Travel Companion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onViewSaved}
              className="flex items-center space-x-2 px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Save className="h-5 w-5" />
              <span className="font-medium">My Saved Itinerary ({savedCount})</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;