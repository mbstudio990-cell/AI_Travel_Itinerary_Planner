import { createClient } from '@supabase/supabase-js';

// Supabase configuration - will be set when connecting to new account
const supabaseUrl = '';
const supabaseAnonKey = '';

// Create a mock client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured. Click "Connect to Supabase" to set up your database connection.');
  
  // Create a mock client that won't cause initialization errors
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Please connect to Supabase first') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Please connect to Supabase first') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: new Error('Please connect to Supabase first') })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Please connect to Supabase first') }),
      update: () => ({ data: null, error: new Error('Please connect to Supabase first') }),
      delete: () => ({ data: null, error: new Error('Please connect to Supabase first') }),
      upsert: () => ({ data: null, error: new Error('Please connect to Supabase first') }),
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