import React, { useState } from 'react';
import { Plus, MapPin, Clock, DollarSign, Lightbulb, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Activity } from '../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: Activity) => void;
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

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
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
    onClose();
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
    onClose();
    setShowCustomForm(false);
    setCustomActivity({
      time: '10:00 AM',
      title: '',
      description: '',
      location: '',
      category: 'Culture',
      costEstimate: getBudgetRange(budget, currency),
      tips: ''
    });
  };

  const handleClose = () => {
    setShowCustomForm(false);
    setCustomActivity({
      time: '10:00 AM',
      title: '',
      description: '',
      location: '',
      category: 'Culture',
      costEstimate: getBudgetRange(budget, currency),
      tips: ''
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Activity - Day ${dayNumber}`}
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        {!showCustomForm ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose from suggestions or create your own
              </h3>
              <p className="text-gray-600">
                Select an activity that matches your interests for {destination}
              </p>
            </div>

            {/* Activity Suggestions */}
            <div className="space-y-6">
              {ACTIVITY_SUGGESTIONS.map((categoryGroup) => (
                <div key={categoryGroup.category}>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mr-3">
                      {categoryGroup.category}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryGroup.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion, categoryGroup.category)}
                        className="text-left p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md group"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-blue-700 mb-1">
                          {suggestion}
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-blue-600">
                          {getBudgetRange(budget, currency)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Custom Activity Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-blue-600 text-lg">Create Custom Activity</span>
              </button>
            </div>
          </div>
        ) : (
          /* Custom Activity Form */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Custom Activity
              </h3>
              <p className="text-gray-600">
                Add your own personalized activity for Day {dayNumber}
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </label>
                  <input
                    type="text"
                    value={customActivity.time}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={customActivity.category}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <input
                  type="text"
                  value={customActivity.title}
                  onChange={(e) => setCustomActivity(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter activity name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={customActivity.location}
                  onChange={(e) => setCustomActivity(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Location in ${destination}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={customActivity.description}
                  onChange={(e) => setCustomActivity(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the activity..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Cost Estimate
                </label>
                <input
                  type="text"
                  value={customActivity.costEstimate}
                  onChange={(e) => setCustomActivity(prev => ({ ...prev, costEstimate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$20-30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="h-4 w-4 inline mr-1" />
                  Tips
                </label>
                <textarea
                  value={customActivity.tips}
                  onChange={(e) => setCustomActivity(prev => ({ ...prev, tips: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any helpful tips for this activity..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Add Custom Activity
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
                  Back to Suggestions
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};