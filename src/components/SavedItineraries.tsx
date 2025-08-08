import React from 'react';
import { ArrowLeft, MapPin, Calendar, Trash2, Eye } from 'lucide-react';
import { Itinerary } from '../types';
import { deleteItinerary } from '../utils/storage';

interface SavedItinerariesProps {
  itineraries: Itinerary[];
  onBack: () => void;
  onView: (itinerary: Itinerary) => void;
  onUpdate: () => void;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({ 
  itineraries, 
  onBack, 
  onView, 
  onUpdate 
}) => {
  const handleDelete = (id: string, event: React.MouseEvent) => {
    // Prevent any event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      deleteItinerary(id);
      onUpdate();
      
      // Show success message
      alert('Itinerary deleted successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Planner</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Saved Itineraries</h1>
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-gray-400 mb-4">
            <MapPin className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Itineraries</h3>
          <p className="text-gray-600 mb-6">
            Create your first travel itinerary to see it saved here.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Plan New Trip
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {itinerary.destination}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(itinerary.startDate).toLocaleDateString()} - 
                        {new Date(itinerary.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {itinerary.days.length} days
                      </span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {itinerary.preferences.budget}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    Interests: {itinerary.preferences.interests.join(', ')}
                  </p>

                  <p className="text-xs text-gray-500">
                    Created: {new Date(itinerary.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(itinerary)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(itinerary.id, e)}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
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
    </div>
  );
};

export default SavedItineraries;