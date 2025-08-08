const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '' as any,
    interests: [],
    currency: 'USD'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required' as any;
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required' as any;
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required' as any;
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date' as any;
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest' as any;
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget level' as any;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
            errors.destination ? 'border-red-500' : ''
          }`}
          placeholder="Where would you like to go?"
        />
        {errors.destination && (
          <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.startDate ? 'border-red-500' : ''
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.endDate ? 'border-red-500' : ''
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Budget Level
        </label>
        <select
          id="budget"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value as any }))}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
            errors.budget ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select budget level</option>
          <option value="Budget">Budget (Under $100/day)</option>
          <option value="Mid-range">Mid-range ($100-300/day)</option>
          <option value="Luxury">Luxury ($300+/day)</option>
        </select>
        {errors.budget && (
          <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Interests (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => handleInterestChange(interest)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <p className="mt-1 text-sm text-red-600">{errors.interests}</p>
        )}
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Preferred Currency
        </label>
        <select
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="CAD">CAD (C$)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating Itinerary...' : 'Generate Itinerary'}
      </button>
    </form>
  );
};