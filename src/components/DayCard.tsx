import React, { useState } from 'react';
import { Calendar, DollarSign, ChevronDown, ChevronUp, MapPin, FileText, Edit3 } from 'lucide-react';
import { DayItinerary } from '../types';
import ActivityCard from './ActivityCard';
import { NotesModal } from './NotesModal';

interface DayCardProps {
  dayItinerary: DayItinerary;
  onSaveNotes?: (dayNumber: number, notes: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ dayItinerary, onSaveNotes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const toggleActivity = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActivities(newExpanded);
  };

  const handleSaveNotes = (dayNumber: number, notes: string) => {
    if (onSaveNotes) {
      onSaveNotes(dayNumber, notes);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 hover:scale-[1.02] transition-all duration-300">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 rounded-2xl w-20 h-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wide">Day</div>
                <div className="text-2xl font-bold text-white">{dayItinerary.day}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-white" />
                <h3 className="text-xl font-bold text-white">{dayItinerary.date}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-white" />
                <span className="text-white font-semibold">Est. {dayItinerary.totalEstimatedCost}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notes Button */}
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                dayItinerary.notes 
                  ? 'bg-yellow-400/30 hover:bg-yellow-400/40 text-white' 
                  : 'hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title="Take Notes"
            >
              {dayItinerary.notes ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </button>
            
            <div className="text-right">
              <div className="text-sm text-white font-medium mb-1">Activities</div>
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

        {/* Notes Preview */}
        {dayItinerary.notes && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mt-1 shadow-sm">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Your Experience</h4>
                <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                  {dayItinerary.notes.length > 150 
                    ? `${dayItinerary.notes.substring(0, 150)}...` 
                    : dayItinerary.notes
                  }
                </p>
                <button
                  onClick={() => setIsNotesModalOpen(true)}
                  className="text-xs text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-gray-200 font-medium mt-1 hover:underline transition-all duration-200"
                >
                  {dayItinerary.notes.length > 150 ? 'Read more' : 'Edit notes'}
                </button>
              </div>
            </div>
          </div>
        )}

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

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        dayItinerary={dayItinerary}
        onSaveNotes={handleSaveNotes}
      />
    </>
  );
};

export default DayCard;