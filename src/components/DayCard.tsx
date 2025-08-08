import React, { useState } from 'react';
import { Calendar, DollarSign, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { DayItinerary } from '../types';
import ActivityCard from './ActivityCard';

interface DayCardProps {
  dayItinerary: DayItinerary;
}

const DayCard: React.FC<DayCardProps> = ({ dayItinerary }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());

  const toggleActivity = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActivities(newExpanded);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 hover:scale-[1.02] transition-all duration-300">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 rounded-2xl w-20 h-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Day</div>
                <div className="text-2xl font-bold text-white">{dayItinerary.day}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-indigo-200" />
                <h3 className="text-xl font-bold text-white">{dayItinerary.date}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-yellow-200" />
                <span className="text-yellow-200 font-semibold">Est. {dayItinerary.totalEstimatedCost}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-white/80 mb-1">Activities</div>
              <div className="text-xl font-bold text-white">{dayItinerary.activities.length}</div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              aria-label={isExpanded ? "Collapse activities" : "Expand activities"}
            >
              {isExpanded ? (
                <ChevronUp className="h-6 w-6 text-white" />
              ) : (
                <ChevronDown className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="mb-4">
            <p className="text-indigo-600 font-semibold text-center">
              {dayItinerary.activities.length} activities planned for this day
            </p>
          </div>
          
          <div className="space-y-4">
            {dayItinerary.activities.map((activity, index) => (
              <ActivityCard
                key={index}
                activity={activity}
                isExpanded={expandedActivities.has(index)}
                onToggle={() => toggleActivity(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCard;