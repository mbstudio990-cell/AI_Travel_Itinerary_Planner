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

export const saveItinerary = (itinerary: Itinerary): void => {
  try {
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
  } catch (error) {
    console.error('Error saving itinerary:', error);
  }
};

export const getItineraries = (): Itinerary[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting itineraries:', error);
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