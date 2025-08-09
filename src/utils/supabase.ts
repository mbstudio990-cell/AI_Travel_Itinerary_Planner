import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Some features may not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types
export interface TravelRequest {
  id: string;
  destinations: string[];
  start_date: string;
  end_date: string;
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  interests: string[];
  currency: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryRecord {
  id: string;
  travel_request_id?: string;
  destination: string;
  total_budget: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DayItineraryRecord {
  id: string;
  itinerary_id?: string;
  day: number;
  date: string;
  total_estimated_cost: string;
  notes?: string;
  created_at?: string;
}

export interface ActivityRecord {
  id: string;
  day_itinerary_id?: string;
  time: string;
  title: string;
  description: string;
  location: string;
  cost_estimate: string;
  tips: string;
  category: string;
  order_index: number;
  created_at?: string;
}