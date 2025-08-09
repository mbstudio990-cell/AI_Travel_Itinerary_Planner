export interface TravelPreferences {
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  interests: string[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  costEstimate: string;
  tips: string;
  category: string;
  selected?: boolean;
}

export interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
  totalEstimatedCost: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  preferences: TravelPreferences;
  days: DayItinerary[];
  totalBudget: string;
  createdAt: string;
}

export interface FormData {
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: 'Budget' | 'Mid-range' | 'Luxury' | '';
  interests: string[];
  currency: string;
}