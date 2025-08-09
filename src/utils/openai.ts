import { supabase } from './supabase';

import { Itinerary } from '../types';

export interface GenerateItineraryRequest {
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: string;
  interests: string[];
  currency: string;
}

export interface GenerateItineraryResponse {
  success: boolean;
  data?: Itinerary;
  error?: string;
}

export const generateItinerary = async (
  request: GenerateItineraryRequest
): Promise<GenerateItineraryResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-itinerary', {
      body: request
    });

    if (error) {
      console.error('Supabase function error:', error);
      
      // Check if it's a connection error
      if (error.message?.includes('Please connect to Supabase first')) {
        return {
          success: false,
          error: 'Please connect to Supabase to use AI itinerary generation. Click "Connect to Supabase" in the top right corner.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to generate itinerary'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error calling generate-itinerary function:', error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message?.includes('Please connect to Supabase first')) {
      return {
        success: false,
        error: 'Please connect to Supabase to use AI itinerary generation. Click "Connect to Supabase" in the top right corner.'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};