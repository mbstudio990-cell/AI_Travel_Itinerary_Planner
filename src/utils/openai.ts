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
    console.log('Calling Supabase edge function with request:', request);
    
    const { data, error } = await supabase.functions.invoke('generate-itinerary', {
      body: request
    });

    console.log('Supabase function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to generate itinerary'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No data received from edge function'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error calling generate-itinerary function:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};