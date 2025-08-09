import React from 'react';
import { Clock, MapPin, DollarSign, Lightbulb, Camera, Utensils, Mountain, Palette, ChevronDown, ChevronUp, Plus, Minus, X } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isExpanded: boolean;
  onToggle: () => void;
  onRemoveActivity?: (activity: Activity) => void;
  showRemove?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  isExpanded, 
  onToggle, 
  onRemoveActivity,
  showRemove = false
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

  const handleRemoveActivity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveActivity) {
      onRemoveActivity(activity);
    }
  };


  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {showRemove && (
            <button
              onClick={handleRemoveActivity}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-110"
              title="Remove activity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className={`${getCategoryColor(activity.category)} p-3 rounded-xl shadow-sm`}>
            {getCategoryIcon(activity.category)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 text-blue-600 inline mr-1" />
                <span className="text-sm font-semibold text-blue-700">{activity.time}</span>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{activity.title}</h3>
          </div>
        </div>
        
        <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200">
          <div className="flex items-center space-x-1 text-green-700 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>{activity.costEstimate}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{activity.description}</p>
        
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-xl">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700 font-medium">{activity.location}</span>
        </div>

        <button
          onClick={onToggle}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 bg-blue-50 hover:bg-blue-100 hover:scale-105 px-4 py-2 rounded-lg"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Tips & Details'}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">💡 Pro Tip</h4>
                  <p className="text-amber-700 leading-relaxed">{activity.tips}</p>
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