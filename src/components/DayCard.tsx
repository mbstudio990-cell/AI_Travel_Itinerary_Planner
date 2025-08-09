import React, { useState } from 'react';
import { Calendar, MapPin, Clock, FileText, Plus, Settings, Trash2, Edit3 } from 'lucide-react';
import { DayItinerary, Activity } from '../types';
import ActivityCard from './ActivityCard';
import { NotesModal } from './NotesModal';
import { AddActivityModal } from './AddActivityModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface DayCardProps {
  dayItinerary: DayItinerary;
  itineraryId?: string;
  destination?: string;
  budget?: string;
  currency?: string;
  onSaveNotes?: (dayNumber: number, notes: string) => void;
  onToggleActivity?: (dayNumber: number, activity: Activity) => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
  dayItinerary, 
  itineraryId,
  destination = '',
  budget = 'Mid-range',
  currency = 'USD',
  onSaveNotes,
  onToggleActivity
}) => {
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);

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

  const handleToggleActivity = (activity: Activity) => {
    if (onToggleActivity) {
      onToggleActivity(dayItinerary.day, activity);
    }
  };

  const handleAddActivity = (activity: Activity) => {
    if (onToggleActivity) {
      onToggleActivity(dayItinerary.day, activity);
    }
  };

  const handleRemoveUnselectedActivities = () => {
    if (onToggleActivity) {
      const selectedActivities = dayItinerary.activities.filter(activity => activity.selected !== false);
      const batchRemoveActivity: Activity = {
        time: '',
        title: '',
        description: '',
        location: '',
        costEstimate: '',
        tips: '',
        category: '',
        batchRemove: true,
        selectedActivities: selectedActivities
      };
      onToggleActivity(dayItinerary.day, batchRemoveActivity);
    }
  };

  // Only show selected activities in normal mode
  const activitiesToShow = customizeMode 
    ? dayItinerary.activities 
    : dayItinerary.activities.filter(activity => activity.selected !== false);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Day {dayItinerary.day}</h3>
              <p className="text-blue-100">{dayItinerary.date}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{activitiesToShow.length} activities</span>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <div className="flex items-center space-x-2 text-white">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{dayItinerary.totalEstimatedCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger 
                  render={
                    <button
                      onClick={() => setShowNotesModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Take Notes</span>
                    </button>
                  }
                />
                <TooltipContent side="bottom" sideOffset={8} arrow>
                  Take Notes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <button
              onClick={() => setCustomizeMode(!customizeMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                customizeMode 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{customizeMode ? 'Exit Customize' : 'Customize'}</span>
            </button>
          </div>

          {customizeMode && (
            <button
              onClick={handleRemoveUnselectedActivities}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove Unselected</span>
            </button>
          )}
        </div>
      </div>

      {/* Customize Mode Info and Add Activity Button */}
      {customizeMode && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 space-y-4">
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-200 p-1 rounded">
                <Edit3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1 text-sm">Customize Your Day</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Toggle activities on/off, add new ones, or remove unselected activities. 
                  Only selected activities will appear in your final itinerary.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Activity</span>
            </button>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="p-6">
        <div className="space-y-4">
          {activitiesToShow.map((activity, index) => (
            <ActivityCard
              key={index}
              activity={activity}
              isExpanded={expandedActivities.has(index)}
              onToggle={() => toggleActivity(index)}
              onToggleActivity={customizeMode ? handleToggleActivity : undefined}
              showManage={customizeMode}
              isSelected={activity.selected !== false}
            />
          ))}
        </div>

        {activitiesToShow.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Selected</h3>
            <p className="text-gray-600 mb-4">
              All activities for this day have been removed. Add some activities to make the most of your day!
            </p>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Add Activities
            </button>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        dayItinerary={dayItinerary}
        onSaveNotes={handleSaveNotes}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        onAddActivity={handleAddActivity}
        dayNumber={dayItinerary.day}
        destination={destination}
        budget={budget}
        currency={currency}
        existingActivities={dayItinerary.activities}
      />
    </div>
  );
};

export default DayCard;