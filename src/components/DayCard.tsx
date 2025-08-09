import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, ChevronDown, ChevronUp, MapPin, FileText, Edit3, Plus } from 'lucide-react';
import { DayItinerary, Activity } from '../types';
import ActivityCard from './ActivityCard';
import { AddActivityModal } from './AddActivityModal';
import { NotesModal } from './NotesModal';
import { loadItineraryNotes } from '../utils/storage';

interface DayCardProps {
  dayItinerary: DayItinerary;
  itineraryId?: string;
  destination?: string;
  budget?: string;
  currency?: string;
  onSaveNotes?: (dayNumber: number, notes: string) => void;
  onToggleActivity?: (dayNumber: number, activity: Activity) => void;
  showManage?: boolean;
  onToggleManageMode?: (dayNumber: number) => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
  dayItinerary, 
  itineraryId, 
  destination = '',
  budget = 'Mid-range',
  currency = 'USD',
  onSaveNotes,
  onToggleActivity,
  showManage = false,
  onToggleManageMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(dayItinerary.notes || '');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [localManageMode, setLocalManageMode] = useState(false);

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

  // In manage mode, show all activities. In view mode, show only selected activities
  const isInManageMode = showManage || localManageMode;
  const displayActivities = isInManageMode 
    ? dayItinerary.activities 
    : dayItinerary.activities.filter(activity => activity.selected !== false);
  
  const toggleActivity = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActivities(newExpanded);
  };

  const handleSaveNotes = async (dayNumber: number, notes: string) => {
    setCurrentNotes(notes);
    if (onSaveNotes) {
      await onSaveNotes(dayNumber, notes);
    }
  };

  const handleToggleActivity = (activity: Activity) => {
    if (onToggleActivity) {
      onToggleActivity(dayItinerary.day, activity);
    }
  };

  const handleToggleLocalManage = () => {
    setLocalManageMode(!localManageMode);
  };

  // Use current notes state instead of dayItinerary.notes
  const displayNotes = currentNotes || dayItinerary.notes;

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
            
            {/* Customize Activities Button */}
            <button
              onClick={handleToggleLocalManage}
              className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 font-medium text-sm ${
                isInManageMode
                  ? 'bg-green-500/30 hover:bg-green-500/40 text-white border border-white/30'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              }`}
              title={isInManageMode ? "Done Customizing" : "Customize Activities"}
            >
              {isInManageMode ? 'Done' : 'Customize'}
            </button>
            
            <div className="text-right">
              <div className="text-sm text-white font-medium mb-1">Activities</div>
              <div className="text-xl font-bold text-white">
                {isInManageMode 
                  ? `${dayItinerary.activities.filter(a => a.selected !== false).length}/${dayItinerary.activities.length}`
                  : displayActivities.length
                }
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
          <div className="flex items-center justify-between mb-4">
            {isInManageMode ? (
              <div className="flex items-center justify-between w-full">
                <p className="text-indigo-600 font-semibold">
                  {dayItinerary.activities.filter(a => a.selected !== false).length} of {dayItinerary.activities.length} activities selected
                </p>
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Activity</span>
                </button>
              </div>
            ) : (
              <p className="text-indigo-600 font-semibold">
                {displayActivities.length} activities planned for this day
              </p>
            )}
          </div>
          
          {isInManageMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Customize Mode:</strong> Check the boxes to add activities to your itinerary, uncheck to remove them. Green border = selected, gray = not selected.
              </p>
            </div>
          )}
          
          {(isInManageMode ? dayItinerary.activities : displayActivities).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activities planned</h4>
              <p className="text-gray-600 mb-4">Add some activities to make this day amazing!</p>
              {isInManageMode && (
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Activity</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isInManageMode ? dayItinerary.activities : displayActivities).map((activity, index) => (
                <ActivityCard
                  key={index}
                  activity={activity}
                  isExpanded={expandedActivities.has(index)}
                  onToggle={() => toggleActivity(index)}
                  onToggleActivity={handleToggleActivity}
                  showManage={isInManageMode}
                  isSelected={activity.selected !== false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        onAddActivity={(activity) => {
          if (onToggleActivity) {
            onToggleActivity(dayItinerary.day, activity);
          }
        }}
        dayNumber={dayItinerary.day}
        destination={destination}
        budget={budget}
        currency={currency}
        existingActivities={dayItinerary.activities}
      />

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