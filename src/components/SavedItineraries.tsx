import React from 'react';
import { ArrowLeft, MapPin, Calendar, Trash2, Eye } from 'lucide-react';
import { Itinerary } from '../types';
import { deleteItinerary } from '../utils/storage';
import { Dialog } from './ui/Dialog';
import { useDialog } from '../hooks/useDialog';

interface SavedItinerariesProps {
  itineraries: Itinerary[];
  onBack: () => void;
  onView: (itinerary: Itinerary) => void;
  onEdit: (itinerary: Itinerary) => void;
  onUpdate: () => void;
  defaultCurrency?: string;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({ 
  itineraries, 
  onBack, 
  onView, 
  onEdit,
  onUpdate,
  defaultCurrency = 'USD'
}) => {
  const { dialogState, showDialog, showConfirm, closeDialog } = useDialog();

  const handleDelete = (id: string, event: React.MouseEvent) => {
    // Prevent any event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    showConfirm({
      title: 'Delete Itinerary',
      message: 'Are you sure you want to delete this itinerary? This action cannot be undone.',
      type: 'confirm',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).then((confirmed) => {
      if (confirmed) {
        deleteItinerary(id);
        onUpdate();
        
        // Show success message
        showDialog({
          title: 'Deleted Successfully',
          message: 'Itinerary deleted successfully!',
          type: 'success'
        });
      }
    });
  };

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Planner</span>
        </button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Saved Itineraries</h1>
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-12 text-center mx-1 sm:mx-auto max-w-none sm:max-w-4xl">
          <div className="text-gray-400 mb-4">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Saved Itineraries</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Create your first travel itinerary to see it saved here.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
          >
            Plan New Trip
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {itinerary.destination}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(itinerary.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - 
                        {new Date(itinerary.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {itinerary.days.length} days
                      </span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {itinerary.preferences.budget}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 break-words">
                    Interests: {itinerary.preferences.interests.join(', ')}
                  </p>

                  <p className="text-xs text-gray-500">
                    Created: {new Date(itinerary.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => onView(itinerary)}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(itinerary.id, e)}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default SavedItineraries;