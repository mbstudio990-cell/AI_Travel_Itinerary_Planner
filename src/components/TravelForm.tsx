import React, { useState, useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { MapPin, DollarSign, Heart, Search, Banknote, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData } from '../types';
import { DatePicker } from './DatePicker';

interface TravelFormProps {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  initialData?: FormData;
}

const INTEREST_OPTIONS = [
  'Culture', 'Nature', 'Food', 'Adventure', 'Relaxation', 
  'History', 'Art', 'Shopping', 'Nightlife', 'Photography',
  'Architecture', 'Music'
];

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
];

const getBudgetRanges = (budget: string, currency: string) => {
  const rates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.75,
    'INR': 83,
    'JPY': 110,
    'CAD': 1.25,
    'AUD': 1.35,
    'CNY': 7.2,
    'KRW': 1200,
    'SGD': 1.35,
    'CHF': 0.92,
    'SEK': 10.5,
    'NOK': 10.8,
    'DKK': 6.8,
    'NZD': 1.45
  };

  const baseRanges = {
    'Budget': { min: 50, max: 100 },
    'Mid-range': { min: 100, max: 200 },
    'Luxury': { min: 200, max: 400 }
  };

  const range = baseRanges[budget as keyof typeof baseRanges];
  const rate = rates[currency] || 1;
  const symbol = CURRENCY_OPTIONS.find(c => c.code === currency)?.symbol || '$';

  const min = Math.round(range.min * rate);
  const max = Math.round(range.max * rate);

  return `${symbol}${min.toLocaleString()}-${max.toLocaleString()}/day`;
};

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<FormData>({
    destinations: [],
    startDate: '',
    endDate: '',
    budget: '',
    interests: [],
    currency: 'USD'
  });

  const [currentDestination, setCurrentDestination] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update form data when initialData changes (for editing)
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    if (formData.destinations.length === 0) {
      setErrorMessage('Please add at least one destination to your trip');
      setShowErrorDialog(true);
      return false;
    }
    
    if (!formData.startDate) {
      setErrorMessage('Please select a start date for your trip');
      setShowErrorDialog(true);
      return false;
    }
    
    if (!formData.endDate) {
      setErrorMessage('Please select an end date for your trip');
      setShowErrorDialog(true);
      return false;
    }
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      setErrorMessage('End date must be after the start date');
      setShowErrorDialog(true);
      return false;
    }
    
    if (formData.interests.length === 0) {
      setErrorMessage('Please select at least one interest to personalize your trip');
      setShowErrorDialog(true);
      return false;
    }
    
    if (!formData.budget) {
      setErrorMessage('Please select a budget level for your trip');
      setShowErrorDialog(true);
      return false;
    }
    
    return true;
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setErrorMessage('');
  };

  const addDestination = () => {
    if (currentDestination.trim() && !formData.destinations.includes(currentDestination.trim())) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, currentDestination.trim()]
      }));
      setCurrentDestination('');
    }
  };

  const removeDestination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const handleDestinationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDestination();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    if (validateForm()) {
      console.log('Form validation passed, calling onSubmit');
      onSubmit(formData);
    } else {
      console.log('Form validation failed');
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleStartDateSelect = (date: Date) => {
    if (!date || !isValid(date)) {
      console.warn('Invalid start date selected:', date);
      return;
    }

    // Create a clean date string in YYYY-MM-DD format
    const dateString = format(date, 'yyyy-MM-dd');
    
    setFormData(prev => ({ 
      ...prev, 
      startDate: dateString,
      // Clear end date if it's before or equal to the new start date
      endDate: prev.endDate && new Date(prev.endDate) <= date ? '' : prev.endDate
    }));
  };

  const handleEndDateSelect = (date: Date) => {
    if (!date || !isValid(date)) {
      console.warn('Invalid end date selected:', date);
      return;
    }

    // Create a clean date string in YYYY-MM-DD format
    const dateString = format(date, 'yyyy-MM-dd');
    
    setFormData(prev => ({ 
      ...prev, 
      endDate: dateString
    }));
  };

  // Memoize date objects to prevent unnecessary re-renders
  const startDateObj = useMemo(() => {
    return formData.startDate ? new Date(formData.startDate) : undefined;
  }, [formData.startDate]);

  const endDateObj = useMemo(() => {
    return formData.endDate ? new Date(formData.endDate) : undefined;
  }, [formData.endDate]);

  const minEndDate = useMemo(() => {
    if (!formData.startDate) return new Date();
    const startDate = new Date(formData.startDate);
    // End date should be at least the day after start date
    return new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  }, [formData.startDate]);

  return (
    <>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto relative">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Plan Your Perfect Trip</h2>
          <p className="text-sm sm:text-base text-gray-600">Tell us about your travel dreams and we'll create a personalized itinerary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Destination Input */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Where would you like to go? (Add multiple destinations)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={currentDestination}
                onChange={(e) => setCurrentDestination(e.target.value)}
                onKeyPress={handleDestinationKeyPress}
                placeholder="Enter destination and press Enter"
                className="w-full pl-10 pr-16 sm:pr-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              />
              {currentDestination.trim() && (
                <button
                  type="button"
                  onClick={addDestination}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
            
            {/* Display added destinations */}
            {formData.destinations.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected destinations:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {formData.destinations.map((destination, index) => (
                    <div
                      key={index}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 font-medium"
                    >
                      <span>{destination}</span>
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        className="text-white hover:text-gray-200 font-bold ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DatePicker
                selected={startDateObj}
                onSelect={handleStartDateSelect}
                placeholder="Select start date"
                minDate={new Date()}
                id="start-date"
                name="startDate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <DatePicker
                selected={endDateObj}
                onSelect={handleEndDateSelect}
                placeholder="Select end date"
                minDate={minEndDate}
                id="end-date"
                name="endDate"
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Banknote className="h-4 w-4 mr-2" />
              Preferred Currency
            </label>
            <div className="relative">
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-base"
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Budget Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Banknote className="h-4 w-4 mr-2" />
              Budget Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {['Budget', 'Mid-range', 'Luxury'].map((budget) => (
                <motion.button
                  key={budget}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    budget: prev.budget === budget ? '' : budget as any 
                  }))}
                  className={`budget-option p-3 rounded-lg border-2 text-center ${
                    formData.budget === budget
                      ? 'border-blue-500 bg-blue-500 text-white font-medium shadow-md selected'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  }`}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: formData.budget === budget 
                      ? "0 8px 25px rgba(59, 130, 246, 0.4)" 
                      : "0 8px 20px rgba(96, 165, 250, 0.2)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  title={formData.budget === budget ? `Click to unselect ${budget}` : `Click to select ${budget}`}
                >
                  <div className="budget-content">
                    <div className="font-medium flex items-center justify-center space-x-2 text-base">
                      {formData.budget === budget && (
                        <span className="text-sm">✓</span>
                      )}
                      <span>{budget}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getBudgetRanges(budget, formData.currency)}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Interests Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Heart className="h-4 w-4 mr-2" />
              What interests you? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <motion.button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`interest-option p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-500 text-white font-medium shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  }`}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: formData.interests.includes(interest) 
                      ? "0 8px 25px rgba(59, 130, 246, 0.4)" 
                      : "0 8px 20px rgba(96, 165, 250, 0.2)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  title={formData.interests.includes(interest) ? `Click to unselect ${interest}` : `Click to select ${interest}`}
                >
                  <div className="interest-content">
                    <span className="flex items-center justify-center space-x-1 text-sm">
                      {formData.interests.includes(interest) && (
                        <span className="text-sm">✓</span>
                      )}
                      <span>{interest}</span>
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-base"
            onClick={(e) => {
              console.log('Generate button clicked');
              console.log('Form data at click:', formData);
              console.log('Loading state:', loading);
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="text-base">AI is crafting your perfect trip...</span>
              </>
            ) : (
              <span className="text-base">{initialData ? 'Update AI Itinerary' : 'Generate AI Itinerary'}</span>
            )}
          </button>
        </form>
      </div>

      {/* Error Dialog Popup */}
      <AnimatePresence>
        {showErrorDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden mx-4"
            >
              {/* Header */}
              <div className="bg-red-500 px-4 sm:px-6 py-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">Required Information Missing</h3>
                    <p className="text-sm text-red-100">Please complete the form to continue</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {errorMessage}
                </p>
                
                <div className="flex justify-end">
                  <button
                    onClick={closeErrorDialog}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TravelForm;