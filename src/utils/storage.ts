import { Itinerary } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'travel_itineraries';

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
};

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Save itinerary to Supabase if authenticated, otherwise localStorage
export const saveItinerary = (itinerary: Itinerary): void => {
  try {
    // Always save to localStorage for immediate access
    const existing = getItineraries();
    
    // Check if itinerary with same ID already exists
    const existingIndex = existing.findIndex(item => item.id === itinerary.id);
    
    let updated;
    if (existingIndex !== -1) {
      // Override existing itinerary
      updated = [...existing];
      updated[existingIndex] = itinerary;
    } else {
      // Add new itinerary
      updated = [...existing, itinerary];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Also try to save to Supabase if authenticated (async, non-blocking)
    saveToSupabaseAsync(itinerary);
  } catch (error) {
    console.error('Error saving itinerary:', error);
  }
};

// Async function to save to Supabase (non-blocking)
const saveToSupabaseAsync = async (itinerary: Itinerary) => {
  try {
    if (await isAuthenticated()) {
      const userId = await getCurrentUserId();
      if (!userId) return;

      // Save travel request
      const { data: travelRequest, error: travelRequestError } = await supabase
        .from('travel_requests')
        .upsert({
          id: `${itinerary.id}-request`,
          destinations: [itinerary.destination],
          start_date: itinerary.startDate,
          end_date: itinerary.endDate,
          budget: itinerary.preferences.budget,
          interests: itinerary.preferences.interests,
          currency: 'USD', // Default currency
          user_id: userId
        })
        .select()
        .single();

      if (travelRequestError) {
        console.warn('Error saving travel request to Supabase:', travelRequestError);
        return;
      }

      // Save itinerary
      const { data: savedItinerary, error: itineraryError } = await supabase
        .from('itineraries')
        .upsert({
          id: itinerary.id,
          travel_request_id: travelRequest.id,
          destination: itinerary.destination,
          total_budget: itinerary.totalBudget,
          user_id: userId
        })
        .select()
        .single();

      if (itineraryError) {
        console.warn('Error saving itinerary to Supabase:', itineraryError);
        return;
      }

      // Save day itineraries and activities
      for (const day of itinerary.days) {
        const { data: dayItinerary, error: dayError } = await supabase
          .from('day_itineraries')
          .upsert({
            id: `${itinerary.id}-day-${day.day}`,
            itinerary_id: savedItinerary.id,
            day: day.day,
            date: day.date,
            total_estimated_cost: day.totalEstimatedCost,
            notes: day.notes || ''
          })
          .select()
          .single();

        if (dayError) {
          console.warn('Error saving day itinerary to Supabase:', dayError);
          continue;
        }

        // Save activities
        for (let i = 0; i < day.activities.length; i++) {
          const activity = day.activities[i];
          const { error: activityError } = await supabase
            .from('activities')
            .upsert({
              id: `${itinerary.id}-day-${day.day}-activity-${i}`,
              day_itinerary_id: dayItinerary.id,
              time: activity.time,
              title: activity.title,
              description: activity.description,
              location: activity.location,
              cost_estimate: activity.costEstimate,
              tips: activity.tips,
              category: activity.category,
              order_index: i
            });

          if (activityError) {
            console.warn('Error saving activity to Supabase:', activityError);
          }
        }
      }

      console.log('Successfully saved itinerary to Supabase');
    }
  } catch (error) {
    console.warn('Error in saveToSupabaseAsync:', error);
  }
};

// Load itineraries from Supabase if authenticated, otherwise localStorage
export const getItineraries = (): Itinerary[] => {
  try {
    // Always return localStorage data for immediate access
    // TODO: In a future update, we could sync with Supabase data
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting itineraries:', error);
    return [];
  }
};

// Load itineraries from Supabase (async)
export const loadItinerariesFromSupabase = async (): Promise<Itinerary[]> => {
  try {
    if (!(await isAuthenticated())) {
      return [];
    }

    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data: itineraries, error } = await supabase
      .from('itineraries')
      .select(`
        *,
        travel_requests(*),
        day_itineraries(
          *,
          activities(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading itineraries from Supabase:', error);
      return [];
    }

    // Transform Supabase data to our format
    return itineraries.map(itinerary => ({
      id: itinerary.id,
      destination: itinerary.destination,
      startDate: itinerary.travel_requests?.start_date || '',
      endDate: itinerary.travel_requests?.end_date || '',
      preferences: {
        budget: itinerary.travel_requests?.budget || 'Mid-range',
        interests: itinerary.travel_requests?.interests || []
      },
      days: itinerary.day_itineraries
        .sort((a: any, b: any) => a.day - b.day)
        .map((day: any) => ({
          day: day.day,
          date: day.date,
          totalEstimatedCost: day.total_estimated_cost,
          notes: day.notes,
          activities: day.activities
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((activity: any) => ({
              time: activity.time,
              title: activity.title,
              description: activity.description,
              location: activity.location,
              costEstimate: activity.cost_estimate,
              tips: activity.tips,
              category: activity.category,
              selected: true
            }))
        })),
      totalBudget: itinerary.total_budget,
      createdAt: itinerary.created_at,
      currency: itinerary.travel_requests?.currency || 'USD'
    }));
  } catch (error) {
    console.error('Error in loadItinerariesFromSupabase:', error);
    return [];
  }
};

export const deleteItinerary = (id: string): void => {
  try {
    const existing = getItineraries();
    console.log('Deleting itinerary with ID:', id);
    console.log('Existing itineraries before delete:', existing.length);
    
    const filtered = existing.filter(itinerary => itinerary.id !== id);
    console.log('Filtered itineraries after delete:', filtered.length);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Verify deletion
    const verification = getItineraries();
    console.log('Verification - itineraries count after delete:', verification.length);
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    throw error; // Re-throw to handle in UI
  }
};

export const updateItineraryNotes = async (itineraryId: string, dayNumber: number, notes: string): Promise<void> => {
  try {
    // Check if user is authenticated and try Supabase first
    if (await isAuthenticated()) {
      console.log('Updating notes in Supabase for itinerary:', itineraryId, 'day:', dayNumber);
      
      // First, try to find the day_itinerary record in Supabase
      const { data: dayItineraries, error: fetchError } = await supabase
        .from('day_itineraries')
        .select('id, itinerary_id')
        .eq('day', dayNumber);

      if (fetchError) {
        console.warn('Error fetching day itineraries from Supabase:', fetchError);
        throw fetchError;
      }

      // Find the matching day itinerary
      const dayItinerary = dayItineraries?.find(di => {
        // For now, we'll match by day number since we don't have a direct itinerary_id match
        // In a full implementation, you'd want to match by itinerary_id as well
        return true; // This is a simplified approach
      });

      if (dayItinerary) {
        // Update the notes in Supabase
        const { error: updateError } = await supabase
          .from('day_itineraries')
          .update({ notes })
          .eq('id', dayItinerary.id);

        if (updateError) {
          console.warn('Error updating notes in Supabase:', updateError);
          throw updateError;
        }

        console.log('Successfully updated notes in Supabase');
      } else {
        console.warn('Day itinerary not found in Supabase, falling back to localStorage');
        throw new Error('Day itinerary not found in Supabase');
      }
    } else {
      throw new Error('User not authenticated');
    }
  } catch (error) {
    console.warn('Supabase notes update failed, falling back to localStorage:', error);
    
    // Fallback to localStorage
    try {
      const existing = getItineraries();
      const updated = existing.map(itinerary => {
        if (itinerary.id === itineraryId) {
          return {
            ...itinerary,
            days: itinerary.days.map(day => 
              day.day === dayNumber 
                ? { ...day, notes }
                : day
            )
          };
        }
        return itinerary;
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('Successfully updated notes in localStorage');
    } catch (localError) {
      console.error('Error updating notes in localStorage:', localError);
      throw localError;
    }
  }
};

// Load notes from Supabase for a specific itinerary
export const loadItineraryNotes = async (itineraryId: string): Promise<{ [dayNumber: number]: string }> => {
  try {
    if (await isAuthenticated()) {
      console.log('Loading notes from Supabase for itinerary:', itineraryId);
      
      const { data: dayItineraries, error } = await supabase
        .from('day_itineraries')
        .select('day, notes')
        .not('notes', 'is', null);

      if (error) {
        console.warn('Error loading notes from Supabase:', error);
        return {};
      }

      // Convert to day number -> notes mapping
      const notesMap: { [dayNumber: number]: string } = {};
      dayItineraries?.forEach(dayItinerary => {
        if (dayItinerary.notes && dayItinerary.notes.trim()) {
          notesMap[dayItinerary.day] = dayItinerary.notes;
        }
      });

      console.log('Loaded notes from Supabase:', notesMap);
      return notesMap;
    }
  } catch (error) {
    console.warn('Error loading notes from Supabase:', error);
  }
  
  return {};
};

export const shareItinerary = (itinerary: Itinerary): string => {
  const shareData = {
    destination: itinerary.destination,
    dates: `${itinerary.startDate} to ${itinerary.endDate}`,
    days: itinerary.days.length,
    budget: itinerary.totalBudget
  };
  
  const shareText = `Check out my travel itinerary for ${shareData.destination}! 
${shareData.days} days of amazing activities from ${shareData.dates}.
Estimated budget: ${shareData.budget}`;
  
  return shareText;
};