import React from 'react';
import { MapPin, Calendar, Banknote, Clock, Heart, Plane } from 'lucide-react';
import { Itinerary } from '../types';
import DayCard from './DayCard';

interface SharedItineraryViewProps {
  itinerary: Itinerary;
  onPlanNewTrip: () => void;
}

const SharedItineraryView: React.FC<SharedItineraryViewProps> = ({ 
  itinerary, 
  onPlanNewTrip 
}) => {
  const handlePlanNewTrip = () => {
    // Clear the URL and go to form
    window.history.pushState({}, '', '/');
    onPlanNewTrip();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Shared Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-xl text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Plane className="h-5 w-5" />
          <span className="font-semibold">Shared Travel Itinerary</span>
        </div>
        <p className="text-sm opacity-90">
          This is a preview of a shared itinerary. Create your own personalized travel plan with full details!
        </p>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{itinerary.destination}</h1>
            <p className="text-xl text-blue-100 mb-8">Shared Travel Itinerary</p>
            
            <div className="flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(itinerary.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(itinerary.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{itinerary.days.length} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Banknote className="h-5 w-5" />
                <span>{itinerary.totalBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.days.length}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.preferences.budget}</div>
              <div className="text-sm text-gray-600">Budget Level</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.preferences.interests.length}</div>
              <div className="text-sm text-gray-600">Interests</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-8 py-6">
          <div className="flex justify-center">
            <button
              onClick={handlePlanNewTrip}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plane className="h-5 w-5" />
              <span>Plan My Own Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Itineraries */}
      {itinerary.days && itinerary.days.length > 0 ? (
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <DayCard 
              key={day.day} 
              dayItinerary={day} 
              currency={itinerary.currency || 'USD'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Itinerary Preview</h3>
          <p className="text-gray-600 mb-6">
            This is a shared itinerary preview for <strong>{itinerary.destination}</strong>.
            The full detailed itinerary with activities is available when you create your own plan.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-900">{itinerary.days?.length || 'Multiple'} days</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="ml-2 text-gray-900">{itinerary.preferences.budget}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <span className="text-2xl">✈️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Inspired by this itinerary?</h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
          Create your own personalized AI-generated travel itinerary with WanderAI. Get customized recommendations based on your preferences, budget, and interests.
        </p>
        <button
          onClick={handlePlanNewTrip}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-medium"
        >
          Start Planning My Trip
        </button>
      </div>
    </div>
  );
};

export default SharedItineraryView;