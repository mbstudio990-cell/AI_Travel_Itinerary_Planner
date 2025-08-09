import React, { useState } from 'react';
import { X, Plus, Clock, MapPin, DollarSign, Lightbulb, Tag } from 'lucide-react';
import { Activity } from '../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: Activity) => void;
  dayNumber: number;
  destination: string;
  budget: string;
  currency: string;
  existingActivities: Activity[];
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  dayNumber,
  destination,
  budget,
  currency,
  existingActivities
}) => {
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    description: '',
    location: '',
    costEstimate: '',
    tips: '',
    category: 'Culture'
  });

  // Define time slots
  const timeSlots = [
    { value: 'Early Morning', label: 'Early Morning (6:00-9:00 AM)', times: ['6:00 AM', '7:00 AM', '8:00 AM'] },
    { value: 'Morning', label: 'Morning (9:00 AM-12:00 PM)', times: ['9:00 AM', '10:00 AM', '11:00 AM'] },
    { value: 'Lunch Time', label: 'Lunch Time (12:00-2:00 PM)', times: ['12:00 PM', '1:00 PM'] },
    { value: 'Afternoon', label: 'Afternoon (2:00-5:00 PM)', times: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { value: 'Evening', label: 'Evening (5:00-8:00 PM)', times: ['5:00 PM', '6:00 PM', '7:00 PM'] },
    { value: 'Night', label: 'Night (8:00 PM-Late)', times: ['8:00 PM', '9:00 PM', '10:00 PM'] }
  ];

  // Check which time slots are occupied
  const getOccupiedTimeSlots = () => {
    const occupied = new Set();
    existingActivities.forEach(activity => {
      const time = activity.time.toLowerCase();
      if ((time.includes('6:') || time.includes('7:') || (time.includes('8:') && time.includes('am'))) && time.includes('am')) {
        occupied.add('Early Morning');
      } else if ((time.includes('9:') || time.includes('10:') || time.includes('11:')) && time.includes('am')) {
        occupied.add('Morning');
      } else if (time.includes('12:') || (time.includes('1:') && time.includes('pm'))) {
        occupied.add('Lunch Time');
      } else if ((time.includes('2:') || time.includes('3:') || time.includes('4:')) && time.includes('pm')) {
        occupied.add('Afternoon');
      } else if ((time.includes('5:') || time.includes('6:') || time.includes('7:')) && time.includes('pm')) {
        occupied.add('Evening');
      } else if ((time.includes('8:') || time.includes('9:') || time.includes('10:') || time.includes('11:') || time.includes('12:')) && time.includes('pm')) {
        occupied.add('Night');
      } else if (time.includes('pm')) {
        occupied.add('Night');
      }
    });
    return occupied;
  };

  const occupiedSlots = getOccupiedTimeSlots();
  const availableSlots = timeSlots.filter(slot => !occupiedSlots.has(slot.value));

  const categories = [
    'Culture',
    'Food',
    'Nature',
    'Adventure',
    'Shopping',
    'Entertainment',
    'Relaxation'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.time || !formData.title || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const newActivity: Activity = {
      ...formData,
      selected: true
    };

    onAddActivity(newActivity);
    
    // Reset form
    setFormData({
      time: '',
      title: '',
      description: '',
      location: '',
      costEstimate: '',
      tips: '',
      category: 'Culture'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  // If all time slots are occupied
  if (availableSlots.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Time Slots Are Equipped!</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your itinerary is fully equipped!</h3>
            <p className="text-gray-600 mb-6">All time slots for Day {dayNumber} have activities planned.</p>
            
            <div className="space-y-2">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Perfect! Close
              </button>
              <button
                onClick={() => {
                  // Allow adding custom activity anyway
                  setFormData(prev => ({ ...prev, time: 'Custom Time' }));
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Add Custom Activity Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Activity - Day {dayNumber}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <Clock className="inline h-4 w-4 mr-2" />
              Time Slot *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {availableSlots.map((slot) => (
                <div key={slot.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{slot.label}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slot.times.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time }))}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.time === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Activity Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Visit Red Fort"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you'll do at this activity..."
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <MapPin className="inline h-4 w-4 mr-2" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`e.g., Chandni Chowk, ${destination}`}
              required
            />
          </div>

          {/* Cost and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost Estimate */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <DollarSign className="inline h-4 w-4 mr-2" />
                Cost Estimate
              </label>
              <input
                type="text"
                value={formData.costEstimate}
                onChange={(e) => setFormData(prev => ({ ...prev, costEstimate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`e.g., ${currency === 'USD' ? '$20' : '₹500'} or Free`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Tag className="inline h-4 w-4 mr-2" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <Lightbulb className="inline h-4 w-4 mr-2" />
              Pro Tips
            </label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any helpful tips for this activity..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Activity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};