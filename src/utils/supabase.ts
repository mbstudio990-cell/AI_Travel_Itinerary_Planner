import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock client. Some features may not work.');
  
  // Create a mock client that won't cause initialization errors
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: function() { return this; },
      not: function() { return this; },
      single: function() { return this; },
      order: function() { return this; }
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

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
  updated_at?: string;
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