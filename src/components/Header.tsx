import React from 'react';
import { Plane, Save, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onViewSaved: () => void;
  savedCount: number;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewSaved, savedCount, onShowAuth }) => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 p-1.5 sm:p-2 rounded-lg">
              <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderAI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Your AI Travel Companion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <UserMenu onViewSaved={onViewSaved} savedCount={savedCount} />
                ) : (
                  <>
                    <button
                      onClick={onViewSaved}
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base hidden sm:inline">My Saved Itinerary ({savedCount})</span>
                      <span className="font-medium text-sm sm:hidden">({savedCount})</span>
                    </button>
                    <button
                      onClick={onShowAuth}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Sign In</span>
                    </button>
                  </>
                )}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;