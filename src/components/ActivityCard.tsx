import React from 'react';
import { Clock, MapPin, DollarSign, Lightbulb, Camera, Utensils, Mountain, Palette, ChevronDown, ChevronUp, Plus, Minus, X } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleActivity?: (activity: Activity) => void;
  showManage?: boolean;
  isSelected?: boolean;
}

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
      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex items-center justify-between">
          {showManage && (
            <div
              onClick={handleToggleActivity}
              className="flex items-center justify-center cursor-pointer"
              title={isSelected ? "Remove from itinerary" : "Add to itinerary"}
            >
              <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isSelected
                  ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                  : 'border-gray-300 hover:border-green-400 bg-white'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          )}
          <div className={`${getCategoryColor(activity.category)} p-2 rounded-lg shadow-sm`}>
            {getCategoryIcon(activity.category)}
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-200">
            <div className="flex items-center space-x-1 text-green-700 font-semibold text-sm">
              <DollarSign className="h-3 w-3" />
              <span>{activity.costEstimate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3 text-blue-600 inline mr-1" />
            <span className="text-xs font-semibold text-blue-700">{activity.time}</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-base leading-tight">{activity.title}</h3>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed text-sm">{activity.description}</p>
        
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-gray-700 font-medium text-sm">{activity.location}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const query = encodeURIComponent(activity.location);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
            className="ml-auto p-1 hover:bg-blue-100 rounded-full transition-colors group"
            title="Open in Google Maps"
          >
            <svg 
              className="h-3 w-3 text-blue-600 group-hover:text-blue-700" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
        </div>

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