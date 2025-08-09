import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Save, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserMenuProps {
  onViewSaved: () => void;
  savedCount: number;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onViewSaved, savedCount }) => {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user display name
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{displayName}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{displayName}</div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onViewSaved();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
            >
              <Save className="h-5 w-5 text-gray-400" />
              <span>My Saved Itineraries</span>
              {savedCount > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};