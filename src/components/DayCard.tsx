import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, ChevronDown, ChevronUp, MapPin, FileText, Edit3 } from 'lucide-react';
import { DayItinerary, Activity } from '../types';
import ActivityCard from './ActivityCard';
import { NotesModal } from './NotesModal';
import { loadItineraryNotes } from '../utils/storage';

interface DayCardProps {
  dayItinerary: DayItinerary;
  itineraryId?: string;
  onSaveNotes?: (dayNumber: number, notes: string) => void;
  onAddActivity?: (dayNumber: number, activity: Activity) => void;
  onRemoveActivity?: (dayNumber: number, activity: Activity) => void;
  showAddRemove?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ 
  dayItinerary, 
  itineraryId, 
  onSaveNotes,
  onAddActivity,
  onRemoveActivity,
  showAddRemove = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(dayItinerary.notes || '');

  // Load notes from Supabase when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      if (itineraryId) {
        try {
          const notesMap = await loadItineraryNotes(itineraryId);
          const dayNotes = notesMap[dayItinerary.day];
          if (dayNotes) {
            setCurrentNotes(dayNotes);
          }
        } catch (error) {
          console.warn('Error loading notes for day:', error);
        }
      }
    };

    loadNotes();
  }, [itineraryId, dayItinerary.day]);

  // Filter activities based on mode
  const displayActivities = showAddRemove 
    ? dayItinerary.activities // Show all activities in management mode
    : dayItinerary.activities.filter(activity => activity.selected !== false); // Show only selected in view mode
  const toggleActivity = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    // Find the original index in the full activities array
    const activity = displayActivities[index];
    const originalIndex = dayItinerary.activities.findIndex(act => 
      act.title === activity.title && act.time === activity.time
    );
    
    if (newExpanded.has(originalIndex)) {
      newExpanded.delete(originalIndex);
    } else {
      newExpanded.add(originalIndex);
    }
    setExpandedActivities(newExpanded);
  };

  const handleSaveNotes = async (dayNumber: number, notes: string) => {
    setCurrentNotes(notes);
    if (onSaveNotes) {
      await onSaveNotes(dayNumber, notes);
    }
  };

  const handleAddActivity = (activity: Activity) => {
    if (onAddActivity) {
      onAddActivity(dayItinerary.day, activity);
    }
  };

  const handleRemoveActivity = (activity: Activity) => {
    if (onRemoveActivity) {
      onRemoveActivity(dayItinerary.day, activity);
    }
  };

  // Use current notes state instead of dayItinerary.notes
  const displayNotes = currentNotes || dayItinerary.notes;

  const addedActivities = displayActivities;
  const totalActivities = dayItinerary.activities.length;

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
                displayNotes 
                  ? 'bg-yellow-400/30 hover:bg-yellow-400/40 text-white' 
                  : 'hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title="Take Notes"
            >
              {displayNotes ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </button>
            
            <div className="text-right">
              <div className="text-sm text-white font-medium mb-1">Activities</div>
              <div className="text-xl font-bold text-white">
                {showAddRemove ? `${addedActivities.length}/${totalActivities}` : addedActivities.length}
              </div>
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
        {displayNotes && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mt-1 shadow-sm">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Your Experience</h4>
                <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                  {displayNotes.length > 150 
                    ? `${displayNotes.substring(0, 150)}...` 
                    : displayNotes
                  }
                </p>
                <button
                  onClick={() => setIsNotesModalOpen(true)}
                  className="text-xs text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-gray-200 font-medium mt-1 hover:underline transition-all duration-200"
                >
                  {displayNotes.length > 150 ? 'Read more' : 'Edit notes'}
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
              {showAddRemove 
                ? `${addedActivities.length} of ${totalActivities} activities selected for this day`
                : `${addedActivities.length} activities planned for this day`
              }
            </p>
            {showAddRemove && (
              <p className="text-sm text-gray-600 text-center mt-1">
                Use the + and - buttons to add/remove activities from your itinerary
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              // Find the original index for expanded state
              const originalIndex = dayItinerary.activities.findIndex(act => 
                act.title === activity.title && act.time === activity.time
              );
              
              return (
              <ActivityCard
                key={index}
                activity={activity}
                isExpanded={expandedActivities.has(originalIndex)}
                onToggle={() => toggleActivity(index)}
                onAddActivity={handleAddActivity}
                onRemoveActivity={handleRemoveActivity}
                showAddRemove={showAddRemove}
                isAdded={activity.selected !== false}
              />
              );
            })}
          </div>
        </div>
      )}
    </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        dayItinerary={{ ...dayItinerary, notes: currentNotes }}
        onSaveNotes={handleSaveNotes}
      />
    </>
  );
};

export default DayCard;