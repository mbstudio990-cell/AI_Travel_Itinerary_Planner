import React from 'react';
import { Clock, MapPin, Banknote, Lightbulb, Camera, Utensils, Mountain, Palette, ChevronDown, ChevronUp, Plus, Minus, X } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleActivity?: (activity: Activity) => void;
  showManage?: boolean;
  isSelected?: boolean;
}

const getPlaceholderImage = (category: string): string => {
  const images = {
    'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'culture': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'nature': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'adventure': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'shopping': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'history': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'art': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'default': 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return images[category.toLowerCase() as keyof typeof images] || images.default;
};
const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  isExpanded, 
  onToggle, 
  onToggleActivity,
  showManage = false,
  isSelected = true
}) => {
  const getCategoryIcon = (category: string) => {
    const iconClass = "h-5 w-5 text-white";
    switch (category.toLowerCase()) {
      case 'food': return <Utensils className={iconClass} />;
      case 'culture': return <Palette className={iconClass} />;
      case 'nature': return <Mountain className={iconClass} />;
      case 'adventure': return <Camera className={iconClass} />;
      default: return <MapPin className={iconClass} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return 'bg-orange-500';
      case 'culture': return 'bg-purple-500';
      case 'nature': return 'bg-green-500';
      case 'adventure': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const handleToggleActivity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleActivity) {
      onToggleActivity(activity);
    }
  };

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
      isSelected 
        ? 'border-green-300 hover:border-green-400 hover:scale-105' 
        : 'border-gray-200 hover:border-blue-300 hover:scale-105 opacity-75'
    }`}>
      
      {/* Activity Content */}
      <div className="p-4">
        {/* Time Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-blue-600 inline mr-1" />
              <span className="text-xs font-semibold text-blue-700">{activity.time}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              activity.category === 'Culture' ? 'bg-purple-100 text-purple-700' :
              activity.category === 'Food' ? 'bg-orange-100 text-orange-700' :
              activity.category === 'Nature' ? 'bg-green-100 text-green-700' :
              activity.category === 'Adventure' ? 'bg-red-100 text-red-700' :
              activity.category === 'Shopping' ? 'bg-pink-100 text-pink-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {activity.category}
            </span>
          </div>
          
          {/* Cost and Manage Toggle moved to header */}
          <div className="flex items-center space-x-2">
            <div className="bg-white border px-3 py-1 rounded-lg shadow-sm">
              <div className="flex items-center space-x-1 text-green-700 font-semibold text-sm">
                <Banknote className="h-3 w-3" />
                <span>{activity.costEstimate}</span>
              </div>
            </div>
            
            {showManage && (
              <div
                onClick={handleToggleActivity}
                className="flex items-center justify-center cursor-pointer"
                title={isSelected ? "Remove from itinerary" : "Add to itinerary"}
              >
                <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isSelected
                    ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                }`}>
                  {isSelected && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Activity Title */}
        <h3 className="font-bold text-gray-900 text-base leading-tight">{activity.title}</h3>

        {/* Activity Description */}
        <p className="text-gray-700 leading-relaxed text-sm">{activity.description}</p>
        
        {/* Location */}
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors group"
            title="Open in Google Maps"
          >
            <MapPin className="h-3 w-3 group-hover:text-blue-600" />
            <span className="text-gray-700 font-medium text-sm group-hover:text-blue-600">{activity.location}</span>
          </a>
        </div>

        {/* Show Details Button */}
        <button
          onClick={onToggle}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 bg-blue-50 hover:bg-blue-100 hover:scale-105 px-3 py-2 rounded-lg text-sm w-full justify-center"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Tips & Details'}</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-1 rounded">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1 text-sm">💡 Pro Tip</h4>
                  <p className="text-amber-700 leading-relaxed text-sm">{activity.tips}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;