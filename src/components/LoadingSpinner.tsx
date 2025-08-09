import React from 'react';
import { Plane, Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-12 w-full max-w-2xl mx-auto text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-blue-600"></div>
        </div>
        <div className="relative z-10 bg-blue-100 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
          <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 animate-bounce" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Creating Your Perfect Itinerary</h3>
          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 px-4">
          Our AI is carefully crafting personalized recommendations just for you...
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="animate-pulse">✨ Analyzing your preferences</div>
          <div className="animate-pulse delay-300">🗺️ Finding amazing attractions</div>
          <div className="animate-pulse delay-700">🍽️ Selecting perfect restaurants</div>
          <div className="animate-pulse delay-1000">⏰ Optimizing your schedule</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;