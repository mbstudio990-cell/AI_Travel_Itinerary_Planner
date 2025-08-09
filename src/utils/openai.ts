import { FormData, Itinerary, DayItinerary, Activity } from '../types';

// Currency conversion rates (in a real app, you'd fetch these from an API)
const CURRENCY_RATES: { [key: string]: number } = {
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

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CNY': '¥',
  'KRW': '₩',
  'SGD': 'S$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'NZD': 'NZ$'
};

const convertCurrency = (usdAmount: number, toCurrency: string): string => {
  const rate = CURRENCY_RATES[toCurrency] || 1;
  const symbol = CURRENCY_SYMBOLS[toCurrency] || '$';
  const convertedAmount = Math.round(usdAmount * rate);
  
  return `${symbol}${convertedAmount.toLocaleString()}`;
};

const convertCurrencyRange = (minUsd: number, maxUsd: number, toCurrency: string): string => {
  const rate = CURRENCY_RATES[toCurrency] || 1;
  const symbol = CURRENCY_SYMBOLS[toCurrency] || '$';
  const convertedMin = Math.round(minUsd * rate);
  const convertedMax = Math.round(maxUsd * rate);
  
  return `${symbol}${convertedMin.toLocaleString()}-${convertedMax.toLocaleString()}`;
};

export const generateItinerary = async (formData: FormData): Promise<Itinerary> => {
  try {
    console.log('generateItinerary called with formData:', formData);
    
    // Check if Supabase is configured (frontend environment variables)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Supabase config check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      urlValid: supabaseUrl?.includes('supabase.co')
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase frontend environment variables not configured. Using mock data.');
      return generateMockItinerary(formData);
    }

    // Validate Supabase URL format
    if (!supabaseUrl.includes('supabase.co')) {
      console.warn('Invalid Supabase URL format. Using mock data.');
      return generateMockItinerary(formData);
    }

    const functionUrl = `${supabaseUrl}/functions/v1/generate-itinerary`;
    
    console.log('Attempting to call Supabase Edge Function...');
    console.log('Function URL:', functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        destinations: formData.destinations,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        interests: formData.interests,
        currency: formData.currency
      })
    });

    console.log('Edge Function response status:', response.status);
    console.log('Edge Function response ok:', response.ok);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Edge Function not found (404). The generate-itinerary function may not be deployed to your Supabase project.');
        console.warn('Falling back to mock data...');
        return generateMockItinerary(formData);
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`Supabase Edge Function error (${response.status}):`, errorData);
      
      // If it's an API key error, provide helpful message
      if (errorData.error && errorData.error.includes('OpenAI API key')) {
        console.error('OpenAI API key issue detected. Please verify:');
        console.error('1. OPENAI_API_KEY is set in Supabase Edge Functions environment variables');
        console.error('2. The API key is valid and starts with "sk-"');
        console.error('3. The Edge Function has been redeployed after adding the key');
      }
      
      if (response.status >= 500) {
        console.warn('Server error detected, falling back to mock data...');
        return generateMockItinerary(formData);
      }
      
      // For client errors (4xx), fall back to mock data instead of throwing
      console.warn('Client error detected, falling back to mock data...');
      return generateMockItinerary(formData);
    }

    const itinerary = await response.json();
    console.log('Received itinerary from Edge Function:', itinerary);
    
    if (itinerary.error) {
      throw new Error(itinerary.error);
    }

    console.log('✅ Successfully generated itinerary via Supabase Edge Function');
    return itinerary;

  } catch (error) {
    console.error('❌ Error generating itinerary via Supabase:', error);
    
    // Always fallback to mock data to ensure app functionality
    console.log('🔄 Falling back to mock data to ensure app functionality...');
    return generateMockItinerary(formData);
  }
};

// Fallback mock data generator
const generateMockItinerary = async (formData: FormData): Promise<Itinerary> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const destinationsText = formData.destinations.join(', ');
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const days: DayItinerary[] = [];
  
  for (let i = 0; i < diffDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    days.push({
      day: i + 1,
      date: currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      activities: generateMockActivities(formData, i + 1),
      totalEstimatedCost: formData.budget === 'Budget' ? convertCurrencyRange(50, 80, formData.currency) : 
                         formData.budget === 'Mid-range' ? convertCurrencyRange(100, 150, formData.currency) : 
                         convertCurrencyRange(200, 300, formData.currency)
    });
  }
  
  return {
    id: Date.now().toString(),
    destination: destinationsText,
    startDate: formData.startDate,
    endDate: formData.endDate,
    preferences: {
      budget: formData.budget,
      interests: formData.interests
    },
    days,
    totalBudget: calculateTotalBudget(formData.budget, diffDays, formData.currency),
    createdAt: new Date().toISOString()
  };
};

const generateMockActivities = (formData: FormData, day: number): Activity[] => {
  const getCostInCurrency = (budgetLevel: string, activityType: 'low' | 'medium' | 'high' | 'free') => {
    if (activityType === 'free') return 'Free';
    
    const baseCosts = {
      'Budget': { low: 12, medium: 15, high: 20 },
      'Mid-range': { low: 20, medium: 25, high: 35 },
      'Luxury': { low: 35, medium: 40, high: 60 }
    };
    
    const cost = baseCosts[budgetLevel as keyof typeof baseCosts][activityType];
    const maxCost = cost + Math.round(cost * 0.5);
    
    return convertCurrencyRange(cost, maxCost, formData.currency);
  };

  const currentDestination = formData.destinations[Math.min(day - 1, formData.destinations.length - 1)] || formData.destinations[0];

  const activities = [
    {
      time: '9:00 AM - 11:30 AM',
      title: `Explore Historic ${currentDestination} Downtown`,
      description: 'Start your day with a walking tour through the historic city center, discovering local architecture and hidden gems.',
      location: `Historic City Center, ${currentDestination}`,
      costEstimate: getCostInCurrency(formData.budget, 'medium'),
      tips: 'Wear comfortable walking shoes and bring a camera for the beautiful architecture.',
      category: 'Culture'
    },
    {
      time: '12:30 PM - 2:00 PM',
      title: 'Local Cuisine Experience',
      description: 'Enjoy an authentic lunch at a highly-rated local restaurant featuring regional specialties.',
      location: `Popular Restaurant District, ${currentDestination}`,
      costEstimate: getCostInCurrency(formData.budget, 'medium'),
      tips: 'Try the local specialty dish - locals recommend it highly!',
      category: 'Food'
    },
    {
      time: '2:30 PM - 4:30 PM',
      title: `${currentDestination} Art Museum`,
      description: 'Discover local and international art collections in this renowned museum.',
      location: `Cultural Arts District, ${currentDestination}`,
      costEstimate: getCostInCurrency(formData.budget, 'low'),
      tips: 'Check for student discounts and free guided tours.',
      category: 'Culture'
    },
    {
      time: '5:00 PM - 6:30 PM',
      title: 'Sunset Viewpoint',
      description: 'End your day at the best viewpoint in the city for spectacular sunset views.',
      location: `Panoramic Viewpoint, ${currentDestination}`,
      costEstimate: getCostInCurrency(formData.budget, 'free'),
      tips: 'Arrive 30 minutes before sunset for the best photos.',
      category: 'Nature'
    }
  ].map(activity => ({ ...activity, selected: true })); // Default all activities to selected
  
  return activities.slice(0, day === 1 ? 4 : 3);
};

const calculateTotalBudget = (budget: string, days: number, currency: string): string => {
  const dailyBudget = budget === 'Budget' ? 65 : budget === 'Mid-range' ? 125 : 250;
  const total = dailyBudget * days;
  return convertCurrencyRange(total - 50, total + 50, currency);
};