import React from 'react';
import { Save, Download, MapPin, Calendar, Banknote, Edit, Heart, Clock, Users, FileDown, BookOpen, Settings, CheckCircle } from 'lucide-react';
import { Itinerary } from '../types';
import DayCard from './DayCard';
import { saveItinerary, updateItineraryNotes, getItineraries } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';
import { TravelSummaryModal } from './TravelSummaryModal';
import { useAuth } from '../hooks/useAuth';
import { Dialog } from './ui/Dialog';
import { useDialog } from '../hooks/useDialog';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave: () => void;
  onEdit: () => void;
  onUpdate?: (updatedItinerary: Itinerary) => void;
  currency?: string;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onSave, onEdit, onUpdate, currency }) => {
  const { isAuthenticated } = useAuth();
  const [currentItinerary, setCurrentItinerary] = React.useState(itinerary);
  const [showTravelSummary, setShowTravelSummary] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const { dialogState, showDialog, showConfirm, closeDialog } = useDialog();

  // Update current itinerary when prop changes
  React.useEffect(() => {
    setCurrentItinerary(itinerary);
  }, [itinerary]);

  // Auto-save function
  const autoSaveItinerary = React.useCallback(async (updatedItinerary: Itinerary) => {
    setAutoSaveStatus('saving');
    try {
      // Check if this itinerary exists in saved itineraries
      const savedItineraries = getItineraries();
      const existingItinerary = savedItineraries.find(saved => saved.id === updatedItinerary.id);
      
      if (existingItinerary) {
        // Auto-save if it's already saved
        saveItinerary(updatedItinerary);
        setAutoSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('idle');
    }
  }, []);
  const handleSave = () => {
    if (!isAuthenticated) {
      // Show auth modal for signup when trying to save
      if (typeof onSave === 'function') {
        onSave(); // This will trigger the auth modal in App.tsx
      }
      return;
    }
    
    saveItinerary(currentItinerary);
    if (typeof onSave === 'function') {
      onSave();
    }
    showDialog({
      title: 'Success!',
      message: 'Itinerary saved successfully!',
      type: 'success'
    });
  };

  const handleEdit = () => {
    if (!isAuthenticated) {
      // Show auth modal for signup when trying to edit
      if (typeof onSave === 'function') {
        onSave(); // This will trigger the auth modal in App.tsx
      }
      return;
    }
    onEdit();
  };


  const handleSaveNotes = (dayNumber: number, notes: string) => {
    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(day => 
        day.day === dayNumber 
          ? { ...day, notes }
          : day
      )
    };
    
    setCurrentItinerary(updatedItinerary);
    
    // Update in storage if it's a saved itinerary
    updateItineraryNotes(updatedItinerary.id, dayNumber, notes).catch(error => {
      console.error('Error saving notes:', error);
      // You might want to show a user-friendly error message here
    });
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedItinerary);
    }

    // Auto-save the itinerary
    autoSaveItinerary(updatedItinerary);
  };

  const handleToggleActivity = (dayNumber: number, activity: Activity) => {
    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(day => 
        day.day === dayNumber 
          ? {
              ...day,
              activities: (() => {
                // Handle batch removal of unselected activities
                if (activity.batchRemove && activity.selectedActivities) {
                  return activity.selectedActivities;
                }
                
                // If activity has remove flag, completely remove it
                if (activity.remove) {
                  return day.activities.filter(act => 
                    !(act.title === activity.title && act.time === activity.time)
                  );
                }
                
                const existingActivityIndex = day.activities.findIndex(act => 
                  act.title === activity.title && act.time === activity.time
                );
                
                if (existingActivityIndex !== -1) {
                  // Toggle existing activity
                  return day.activities.map((act, index) => 
                    index === existingActivityIndex
                      ? { ...act, selected: act.selected === false ? true : false }
                      : act
                  );
                } else {
                  // Add new activity
                  return [...day.activities, { ...activity, selected: true }];
                }
              })()
            }
          : day
      )
    };
    
    setCurrentItinerary(updatedItinerary);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedItinerary);
    }

    // Auto-save the itinerary
    autoSaveItinerary(updatedItinerary);
  };


  const handleDownloadPDF = async () => {
    try {
      await generatePDF(currentItinerary);
      showDialog({
        title: 'PDF Downloaded!',
        message: 'Your travel itinerary has been successfully downloaded as a PDF file.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showDialog({
        title: 'PDF Generation Error',
        message: 'Sorry, there was an error generating the PDF. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4 sm:mb-6">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">{currentItinerary.destination}</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">Your Perfect Travel Itinerary</p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-blue-100 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{new Date(currentItinerary.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(currentItinerary.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{currentItinerary.days.length} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{currentItinerary.totalBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl mb-2 sm:mb-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{currentItinerary.days.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl mb-2 sm:mb-3">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{currentItinerary.preferences.budget}</div>
              <div className="text-xs sm:text-sm text-gray-600">Budget Level</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl mb-2 sm:mb-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="text-sm sm:text-base font-bold text-gray-900 px-2">
                {currentItinerary.preferences.interests.slice(0, 2).join(', ')}
                {currentItinerary.preferences.interests.length > 2 && ` +${currentItinerary.preferences.interests.length - 2} more`}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Selected Interests</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowTravelSummary(true)}
                className="flex flex-col items-center justify-center w-full h-full p-3 sm:p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl mb-2 sm:mb-3 transition-colors">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Travel Notes</div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* Auto-save Status */}
          {autoSaveStatus !== 'idle' && (
            <div className="flex justify-center mb-4">
              <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
                autoSaveStatus === 'saving' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {autoSaveStatus === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-600"></div>
                    <span>Auto-saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Auto-saved!</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Edit Plan</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>


      {/* Travel Summary Modal */}
      <TravelSummaryModal
        isOpen={showTravelSummary}
        onClose={() => setShowTravelSummary(false)}
        itinerary={currentItinerary}
      />

      {/* Dialog Modal */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
        onConfirm={dialogState.onConfirm}
      />

      {/* Daily Itineraries */}
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {currentItinerary.days.map((day) => (
          <DayCard 
            key={day.day} 
            dayItinerary={day} 
            itineraryId={currentItinerary.id}
            destination={currentItinerary.destination}
            budget={currentItinerary.preferences.budget}
            currency={currency}
            onSaveNotes={handleSaveNotes}
            onToggleActivity={handleToggleActivity}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6">
          <span className="text-2xl">🌟</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Have an Amazing Trip!</h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your personalized AI-generated itinerary is ready. Don't forget to save it and share with your travel companions for an unforgettable adventure!
        </p>
      </div>
    </div>
  );
};

export default ItineraryDisplay;