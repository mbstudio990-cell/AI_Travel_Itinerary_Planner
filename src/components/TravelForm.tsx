import React, { useState, useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { MapPin, DollarSign, Heart, Search, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
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
    time: '10:00 AM - 12:00 PM',
    destinations: [],
    startDate: '',
    endDate: '',
    budget: '',
    interests: [],
    currency: 'USD'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [currentDestination, setCurrentDestination] = useState('');

  // Update form data when initialData changes (for editing)
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Clear any existing errors when loading initial data
      setErrors({});
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (formData.destinations.length === 0) {
      newErrors.destinations = 'At least one destination is required' as any;
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest' as any;
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addDestination = () => {
    if (currentDestination.trim() && !formData.destinations.includes(currentDestination.trim())) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, currentDestination.trim()]
      }));
      setCurrentDestination('');
      // Clear any existing errors
      if (errors.destinations) {
        setErrors(prev => ({ ...prev, destinations: undefined }));
      }
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
      console.log('Form validation failed, errors:', errors);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
    
    // Clear interest errors when user makes a selection
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: undefined }));
    }
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

    // Clear any existing errors
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: undefined }));
    }
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

    // Clear any existing errors
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: undefined }));
    }
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
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Perfect Trip</h2>
        <p className="text-gray-600">Tell us about your travel dreams and we'll create a personalized itinerary</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter destination and press Enter (e.g., Paris, Tokyo, New York)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {currentDestination.trim() && (
              <button
                type="button"
                onClick={addDestination}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            )}
          </div>
          
          {/* Display added destinations */}
          {formData.destinations.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Selected destinations:</p>
              <div className="flex flex-wrap gap-2">
                {formData.destinations.map((destination, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 font-medium"
                  >
                    <span>{destination}</span>
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="text-white hover:text-gray-200 font-bold ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.destinations && (
            <p className="mt-1 text-sm text-red-600">{errors.destinations as string}</p>
          )}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <DatePicker
              selected={startDateObj}
              onSelect={handleStartDateSelect}
              placeholder="Select start date"
              minDate={new Date()}
              error={!!errors.startDate}
              id="start-date"
              name="startDate"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
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
              error={!!errors.endDate}
              id="end-date"
              name="endDate"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
          <div className="grid grid-cols-3 gap-3">
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
                  <div className="font-medium flex items-center justify-center space-x-2">
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
          {errors.budget && (
            <p className="mt-2 text-sm text-red-600">{errors.budget}</p>
          )}
        </div>

        {/* Interests Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
            <Heart className="h-4 w-4 mr-2" />
            What interests you? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                  <span className="flex items-center justify-center space-x-2">
                    {formData.interests.includes(interest) && (
                      <span className="text-sm">✓</span>
                    )}
                    <span>{interest}</span>
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
          {errors.interests && (
            <p className="mt-2 text-sm text-red-600">{errors.interests as string}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          onClick={(e) => {
            console.log('Generate button clicked');
            console.log('Form data at click:', formData);
            console.log('Loading state:', loading);
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI is crafting your perfect trip...</span>
            </>
          ) : (
            <span>{initialData ? 'Update AI Itinerary' : 'Generate AI Itinerary'}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default TravelForm;