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
  const [hasBeenCustomized, setHasBeenCustomized] = useState(false);

  // Helper function to parse time and sort activities chronologically
  const parseTimeForSorting = (timeString: string): number => {
    // Extract the start time from ranges like "9:00 AM - 11:30 AM" or single times like "9:00 AM"
    const startTime = timeString.split(' - ')[0].trim();
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    return hour24 * 60 + minutes; // Convert to minutes for easy sorting
  };

  // Sort activities by time
  const sortActivitiesByTime = (activities: Activity[]) => {
    return [...activities].sort((a, b) => {
      const timeA = parseTimeForSorting(a.time);
      const timeB = parseTimeForSorting(b.time);
      return timeA - timeB;
    });
  };

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

  // Track if activities have been customized
  useEffect(() => {
    const hasUnselectedActivities = dayItinerary.activities.some(activity => activity.selected === false);
    if (hasUnselectedActivities) {
      setHasBeenCustomized(true);
    }
  }, [dayItinerary.activities]);

  // In manage mode, show all activities if never customized, otherwise show only selected
  // In view mode, always show only selected activities
  const isInManageMode = showManage || localManageMode;
  const displayActivities = dayItinerary.activities.filter(activity => activity.selected !== false);
  const sortedDisplayActivities = sortActivitiesByTime(displayActivities);
  
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
    const newManageMode = !localManageMode;
    setLocalManageMode(newManageMode);
    
    // If exiting manage mode (clicking Done), remove unselected activities
    if (!newManageMode && localManageMode) {
      // Remove ALL unselected activities from the data structure at once
      if (onToggleActivity) {
        const unselectedActivities = dayItinerary.activities.filter(activity => activity.selected === false);
        
        // Create a batch removal by filtering out all unselected activities
        const selectedActivities = dayItinerary.activities.filter(activity => activity.selected !== false);
        
        // Signal to parent to replace the entire activities array with only selected ones
        if (unselectedActivities.length > 0) {
          onToggleActivity(dayItinerary.day, { 
            title: '__BATCH_REMOVE_UNSELECTED__', 
            time: '', 
            description: '', 
            location: '', 
            costEstimate: '', 
            tips: '', 
            category: '',
            batchRemove: true,
            selectedActivities: selectedActivities
          });
        }
      }
      setHasBeenCustomized(true);
    }
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
            <div className="space-y-4">
              {/* Timeline Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Daily Schedule</h4>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Timeline List */}
              <div className="space-y-3">
                {(isInManageMode ? sortActivitiesByTime(dayItinerary.activities) : sortedDisplayActivities).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        activity.selected !== false 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-gray-300 border-gray-300'
                      }`}></div>
                      {index < (isInManageMode ? dayItinerary.activities.length - 1 : sortedDisplayActivities.length - 1) && (
                        <div className="w-px h-16 bg-gray-200 mt-2"></div>
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                        activity.selected !== false 
                          ? 'border-green-200 hover:border-green-300' 
                          : 'border-gray-200 opacity-75'
                      }`}>
                        {/* Activity Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {/* Time Badge */}
                            <div className="inline-flex items-center space-x-2 mb-2">
                              <div className="bg-blue-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-semibold text-blue-700">{activity.time}</span>
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

                            {/* Activity Title */}
                            <h5 className="font-bold text-gray-900 text-lg mb-2">{activity.title}</h5>
                            
                            {/* Location */}
                            <div className="flex items-center space-x-2 text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{activity.location}</span>
                            </div>
                          </div>

                          {/* Cost and Manage Controls */}
                          <div className="flex items-center space-x-3">
                            {/* Cost Badge */}
                            <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                              <span className="text-sm font-semibold text-green-700">{activity.costEstimate}</span>
                            </div>

                            {/* Manage Checkbox */}
                            {isInManageMode && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActivity(activity);
                                }}
                                className="flex items-center justify-center cursor-pointer"
                                title={activity.selected !== false ? "Remove from itinerary" : "Add to itinerary"}
                              >
                                <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                  activity.selected !== false
                                    ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                                    : 'border-gray-300 hover:border-green-400 bg-white'
                                }`}>
                                  {activity.selected !== false && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Activity Description */}
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">{activity.description}</p>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleActivity(index)}
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm"
                        >
                          <span>{expandedActivities.has(index) ? 'Hide Details' : 'Show Tips & Details'}</span>
                          {expandedActivities.has(index) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {/* Expanded Details */}
                        {expandedActivities.has(index) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="bg-amber-100 p-2 rounded-lg">
                                  <Lightbulb className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <h6 className="font-semibold text-amber-800 mb-2 text-sm">💡 Pro Tip</h6>
                                  <p className="text-amber-700 leading-relaxed text-sm">{activity.tips}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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