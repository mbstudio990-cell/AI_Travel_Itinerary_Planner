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
  existingActivities: Activity[];
}

// Time-based activity suggestions
const getTimeBasedSuggestions = (timeSlot: string, destination: string) => {
  const suggestions = {
    'Early Morning (6:00-9:00 AM)': [
      { category: 'Nature', title: 'Sunrise Viewpoint Visit', description: 'Watch the sunrise from the best viewpoint in the city' },
      { category: 'Adventure', title: 'Morning Jog in City Park', description: 'Start your day with a refreshing jog through local parks' },
      { category: 'Culture', title: 'Early Morning Temple Visit', description: 'Experience peaceful morning prayers and rituals' },
      { category: 'Food', title: 'Local Breakfast Market', description: 'Try authentic breakfast dishes at the local market' },
      { category: 'Adventure', title: 'Morning Yoga Session', description: 'Join a local yoga class or practice in a scenic location' }
    ],
    'Morning (9:00 AM-12:00 PM)': [
      { category: 'Culture', title: 'Museum Visit', description: 'Explore the city\'s main museum with fewer crowds' },
      { category: 'Culture', title: 'Historic Walking Tour', description: 'Join a guided tour of the historic district' },
      { category: 'Adventure', title: 'City Bike Tour', description: 'Explore the city on two wheels with a guided tour' },
      { category: 'Nature', title: 'Botanical Garden Visit', description: 'Stroll through beautiful gardens and green spaces' },
      { category: 'Shopping', title: 'Local Artisan Market', description: 'Browse handmade crafts and local products' }
    ],
    'Lunch Time (12:00-2:00 PM)': [
      { category: 'Food', title: 'Traditional Restaurant Experience', description: 'Enjoy authentic local cuisine at a recommended restaurant' },
      { category: 'Food', title: 'Street Food Tour', description: 'Sample various street foods with a local guide' },
      { category: 'Food', title: 'Rooftop Dining', description: 'Lunch with a view at a rooftop restaurant' },
      { category: 'Food', title: 'Food Market Exploration', description: 'Discover local ingredients and try fresh foods' },
      { category: 'Culture', title: 'Cooking Class', description: 'Learn to prepare local dishes in a hands-on class' }
    ],
    'Afternoon (2:00-5:00 PM)': [
      { category: 'Culture', title: 'Art Gallery Visit', description: 'Explore contemporary and traditional art collections' },
      { category: 'Adventure', title: 'Photography Walk', description: 'Capture the city\'s beauty with a photography tour' },
      { category: 'Shopping', title: 'Shopping District Tour', description: 'Browse local shops and boutiques' },
      { category: 'Culture', title: 'Cultural Center Visit', description: 'Learn about local traditions and history' },
      { category: 'Nature', title: 'Scenic City Walk', description: 'Explore scenic neighborhoods and hidden gems' }
    ],
    'Evening (5:00-8:00 PM)': [
      { category: 'Nature', title: 'Sunset Viewpoint', description: 'Watch the sunset from the city\'s best vantage point' },
      { category: 'Culture', title: 'Evening Cultural Show', description: 'Attend a traditional music or dance performance' },
      { category: 'Adventure', title: 'River/Harbor Cruise', description: 'Enjoy the city from the water during golden hour' },
      { category: 'Food', title: 'Happy Hour & Local Drinks', description: 'Try local beverages and appetizers' },
      { category: 'Shopping', title: 'Evening Market Visit', description: 'Experience the vibrant atmosphere of evening markets' }
    ],
    'Night (8:00 PM-Late)': [
      { category: 'Food', title: 'Fine Dining Experience', description: 'Enjoy an upscale dinner at a renowned restaurant' },
      { category: 'Culture', title: 'Night Walking Tour', description: 'Discover the city\'s nighttime charm and illuminated landmarks' },
      { category: 'Adventure', title: 'Nightlife Experience', description: 'Experience local bars, clubs, or entertainment venues' },
      { category: 'Culture', title: 'Night Market Visit', description: 'Browse night markets with food and shopping' },
      { category: 'Nature', title: 'Stargazing Spot', description: 'Find a quiet spot to enjoy the night sky' }
    ]
  };

  return suggestions[timeSlot as keyof typeof suggestions] || [];
};

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
  currency,
  existingActivities
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

  // Calculate available time slots
  const getAvailableTimeSlots = () => {
    const allTimeSlots = [
      'Early Morning (6:00-9:00 AM)',
      'Morning (9:00 AM-12:00 PM)', 
      'Lunch Time (12:00-2:00 PM)',
      'Afternoon (2:00-5:00 PM)',
      'Evening (5:00-8:00 PM)',
      'Night (8:00 PM-Late)'
    ];

    const occupiedSlots = existingActivities.map(activity => {
      const time = activity.time.toLowerCase();
      if (time.includes('6:') || time.includes('7:') || time.includes('8:') && time.includes('am')) {
        return 'Early Morning (6:00-9:00 AM)';
      } else if (time.includes('9:') || time.includes('10:') || time.includes('11:') && time.includes('am')) {
        return 'Morning (9:00 AM-12:00 PM)';
      } else if (time.includes('12:') || time.includes('1:') && time.includes('pm')) {
        return 'Lunch Time (12:00-2:00 PM)';
      } else if (time.includes('2:') || time.includes('3:') || time.includes('4:') && time.includes('pm')) {
        return 'Afternoon (2:00-5:00 PM)';
      } else if (time.includes('5:') || time.includes('6:') || time.includes('7:') && time.includes('pm')) {
        return 'Evening (5:00-8:00 PM)';
      } else {
        return 'Night (8:00 PM-Late)';
      }
    });

    return allTimeSlots.filter(slot => !occupiedSlots.includes(slot));
  };

  const availableTimeSlots = getAvailableTimeSlots();

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
                Add Activity Based on Available Time
              </h3>
              <p className="text-gray-600">
                Here are suggestions for your available time slots in {destination}
              </p>
            </div>

            {availableTimeSlots.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Day is Fully Scheduled!</h4>
                <p className="text-gray-600 mb-4">
                  All time slots are occupied. You can still create a custom activity or replace an existing one.
                </p>
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Create Custom Activity
                </button>
              </div>
            ) : (
              <>
                {/* Time-based Activity Suggestions */}
                <div className="space-y-6">
                  {availableTimeSlots.map((timeSlot) => {
                    const suggestions = getTimeBasedSuggestions(timeSlot, destination);
                    return (
                      <div key={timeSlot}>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mr-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {timeSlot}
                          </div>
                          <span className="text-green-600 text-sm">Available</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion.title}
                              onClick={() => {
                                const timeMap = {
                                  'Early Morning (6:00-9:00 AM)': '7:00 AM',
                                  'Morning (9:00 AM-12:00 PM)': '10:00 AM',
                                  'Lunch Time (12:00-2:00 PM)': '12:30 PM',
                                  'Afternoon (2:00-5:00 PM)': '3:00 PM',
                                  'Evening (5:00-8:00 PM)': '6:00 PM',
                                  'Night (8:00 PM-Late)': '8:00 PM'
                                };
                                
                                const activity: Activity = {
                                  time: timeMap[timeSlot as keyof typeof timeMap],
                                  title: suggestion.title,
                                  description: suggestion.description,
                                  location: `${destination}`,
                                  category: suggestion.category,
                                  costEstimate: getBudgetRange(budget, currency),
                                  tips: 'Check opening hours and book in advance if needed.',
                                  selected: true
                                };
                                
                                onAddActivity(activity);
                                onClose();
                              }}
                              className="text-left p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md group"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  suggestion.category === 'Culture' ? 'bg-purple-100 text-purple-700' :
                                  suggestion.category === 'Food' ? 'bg-orange-100 text-orange-700' :
                                  suggestion.category === 'Nature' ? 'bg-green-100 text-green-700' :
                                  suggestion.category === 'Adventure' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {suggestion.category}
                                </span>
                              </div>
                              <div className="font-medium text-gray-900 group-hover:text-blue-700 mb-1">
                                {suggestion.title}
                              </div>
                              <div className="text-sm text-gray-600 group-hover:text-blue-600 mb-2">
                                {suggestion.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getBudgetRange(budget, currency)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {/* Custom Activity Button */}
            <div className="space-y-6">
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