import React, { useState } from 'react';
import { Plus, MapPin, Clock, DollarSign, Lightbulb, X } from 'lucide-react';
import { Activity } from '../types';

interface AddActivityCardProps {
  onAddActivity: (activity: Activity) => void;
  onCancel: () => void;
  dayNumber: number;
  destination: string;
  budget: string;
  currency: string;
}

const ACTIVITY_SUGGESTIONS = [
  {
    category: 'Culture',
    suggestions: [
      'Visit Local Museum',
      'Historic Walking Tour',
      'Art Gallery Visit',
      'Cultural Center Tour',
      'Traditional Market Visit'
    ]
  },
  {
    category: 'Food',
    suggestions: [
      'Local Restaurant Experience',
      'Street Food Tour',
      'Cooking Class',
      'Food Market Visit',
      'Wine/Beer Tasting'
    ]
  },
  {
    category: 'Nature',
    suggestions: [
      'City Park Visit',
      'Botanical Garden',
      'Scenic Viewpoint',
      'River/Lake Walk',
      'Nature Trail'
    ]
  },
  {
    category: 'Adventure',
    suggestions: [
      'City Bike Tour',
      'Boat Trip',
      'Photography Walk',
      'Adventure Sports',
      'Outdoor Activity'
    ]
  },
  {
    category: 'Shopping',
    suggestions: [
      'Local Shopping District',
      'Souvenir Shopping',
      'Artisan Market',
      'Mall Visit',
      'Boutique Shopping'
    ]
  }
];

const getBudgetRange = (budget: string, currency: string) => {
  const ranges = {
    'Budget': { min: 10, max: 25 },
    'Mid-range': { min: 20, max: 40 },
    'Luxury': { min: 35, max: 70 }
  };
  
  const range = ranges[budget as keyof typeof ranges] || ranges['Mid-range'];
  const symbols: { [key: string]: string } = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
    'CAD': 'C$', 'AUD': 'A$', 'CNY': '¥', 'KRW': '₩', 'SGD': 'S$'
  };
  
  const symbol = symbols[currency] || '$';
  return `${symbol}${range.min}-${range.max}`;
};

export const AddActivityCard: React.FC<AddActivityCardProps> = ({
  onAddActivity,
  onCancel,
  dayNumber,
  destination,
  budget,
  currency
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customActivity, setCustomActivity] = useState({
    time: '10:00 AM',
    title: '',
    description: '',
    location: '',
    category: 'Culture',
    costEstimate: getBudgetRange(budget, currency),
    tips: ''
  });

  const handleSuggestionClick = (suggestion: string, category: string) => {
    const activity: Activity = {
      time: '10:00 AM',
      title: suggestion,
      description: `Enjoy ${suggestion.toLowerCase()} in ${destination}. A great way to experience the local ${category.toLowerCase()}.`,
      location: `${destination}`,
      category,
      costEstimate: getBudgetRange(budget, currency),
      tips: `Book in advance for better rates. Check opening hours before visiting.`,
      selected: true
    };
    
    onAddActivity(activity);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActivity.title.trim()) return;
    
    const activity: Activity = {
      ...customActivity,
      location: customActivity.location || destination,
      description: customActivity.description || `Experience ${customActivity.title} in ${destination}.`,
      tips: customActivity.tips || 'Enjoy this custom activity!',
      selected: true
    };
    
    onAddActivity(activity);
  };

  if (showCustomForm) {
    return (
      <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Add Custom Activity</h4>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="text"
                value={customActivity.time}
                onChange={(e) => setCustomActivity(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10:00 AM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={customActivity.category}
                onChange={(e) => setCustomActivity(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Culture">Culture</option>
                <option value="Food">Food</option>
                <option value="Nature">Nature</option>
                <option value="Adventure">Adventure</option>
                <option value="Shopping">Shopping</option>
                <option value="History">History</option>
                <option value="Art">Art</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title *</label>
            <input
              type="text"
              value={customActivity.title}
              onChange={(e) => setCustomActivity(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter activity name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={customActivity.location}
              onChange={(e) => setCustomActivity(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Location in ${destination}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={customActivity.description}
              onChange={(e) => setCustomActivity(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the activity..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Estimate</label>
            <input
              type="text"
              value={customActivity.costEstimate}
              onChange={(e) => setCustomActivity(prev => ({ ...prev, costEstimate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="$20-30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tips</label>
            <textarea
              value={customActivity.tips}
              onChange={(e) => setCustomActivity(prev => ({ ...prev, tips: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any helpful tips for this activity..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Add Activity
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              Back to Suggestions
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Add New Activity</h4>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-4">
        {ACTIVITY_SUGGESTIONS.map((categoryGroup) => (
          <div key={categoryGroup.category}>
            <h5 className="font-medium text-gray-800 mb-2">{categoryGroup.category}</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryGroup.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion, categoryGroup.category)}
                  className="text-left p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="font-medium text-gray-900">{suggestion}</div>
                  <div className="text-sm text-gray-600">{getBudgetRange(budget, currency)}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">Create Custom Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};