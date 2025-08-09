export interface TravelPreferences {
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  interests: string[];
}

export interface Activity {
  id?: string;
  time: string;
  title: string;
  description: string;
  location: string;
  costEstimate: string;
  tips: string;
  category: string;
  selected?: boolean;
  remove?: boolean;
  batchRemove?: boolean;
  selectedActivities?: Activity[];
}

export interface DayItinerary {
  id?: string;
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
  currency?: string;
}

export interface FormData {
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: 'Budget' | 'Mid-range' | 'Luxury' | '';
  interests: string[];
  currency: string;
}