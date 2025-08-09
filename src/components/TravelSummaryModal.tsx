import React from 'react';
import { Calendar, MapPin, FileText, BookOpen, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Itinerary } from '../types';

interface TravelSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
}

export const TravelSummaryModal: React.FC<TravelSummaryModalProps> = ({
  isOpen,
  onClose,
  itinerary
}) => {
  const daysWithNotes = itinerary.days.filter(day => day.notes && day.notes.trim());
  const totalNotes = daysWithNotes.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Travel Summary"
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        {/* Trip Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {itinerary.destination}
              </h3>
              <p className="text-sm text-white/90">
                {new Date(itinerary.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(itinerary.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-white/90">
                {itinerary.days.length} days • {totalNotes} days with notes
              </p>
            </div>
          </div>
        </div>

        {/* Notes Summary */}
        {totalNotes > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Your Travel Experience</h4>
            </div>

            {daysWithNotes.map((day) => (
              <div key={day.day} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                {/* Day Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      Day {day.day} - {day.date}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {day.activities.length} activities • {day.totalEstimatedCost}
                    </p>
                  </div>
                </div>

                {/* Activities Summary */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Activities:</h6>
                  <div className="flex flex-wrap gap-2">
                    {day.activities.map((activity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {activity.time} - {activity.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* User Notes */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mt-1 shadow-sm">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h6 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Your Experience</h6>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                        {day.notes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Notes State */
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Travel Notes Yet</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Start documenting your travel experiences by adding notes to each day of your itinerary. 
              Your memories and insights will appear here as a comprehensive travel summary.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Trip created on {new Date(itinerary.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Close Summary
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};