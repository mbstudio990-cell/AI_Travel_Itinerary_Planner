import React, { useState, useEffect } from 'react';
import { Save, FileText, Calendar, MapPin } from 'lucide-react';
import { Modal } from './ui/Modal';
import { DayItinerary } from '../types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayItinerary: DayItinerary;
  onSaveNotes: (dayNumber: number, notes: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  dayItinerary,
  onSaveNotes
}) => {
  const [notes, setNotes] = useState(dayItinerary.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update notes when dayItinerary changes
  useEffect(() => {
    setNotes(dayItinerary.notes || '');
  }, [dayItinerary.notes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSaveNotes(dayItinerary.day, notes);
      // Show success feedback
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving notes:', error);
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset notes to original value if user cancels
    setNotes(dayItinerary.notes || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Notes for Day ${dayItinerary.day}`}
      maxWidth="max-w-3xl"
    >
      <div className="p-6">
        {/* Day Info Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Day {dayItinerary.day} - {dayItinerary.date}
              </h3>
              <p className="text-sm text-white/90">
                {dayItinerary.activities.length} activities planned • Est. {dayItinerary.totalEstimatedCost}
              </p>
            </div>
          </div>
        </div>

        {/* Activities Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Today's Activities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dayItinerary.activities.map((activity, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {activity.time}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{activity.category}</span>
                </div>
                <h5 className="font-medium text-gray-900 text-sm">{activity.title}</h5>
                <p className="text-xs text-gray-600 mt-1">{activity.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Your Experience & Notes
            </label>
          </div>
          
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share your experiences, thoughts, and memories from this day...

• How did the activities go?
• What were the highlights?
• Any tips for future travelers?
• Photos or moments you want to remember?
• Changes you'd make to the itinerary?"
            className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
            style={{ fontFamily: 'inherit' }}
          />
          
          <div className="text-xs text-gray-500">
            {notes.length} characters • Your notes are saved locally and privately
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Notes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};