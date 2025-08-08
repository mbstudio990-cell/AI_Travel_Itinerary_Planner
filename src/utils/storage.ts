import { Itinerary } from '../types';

const STORAGE_KEY = 'travel_itineraries';

export const saveItinerary = (itinerary: Itinerary): void => {
  try {
    const existing = getItineraries();
    const updated = [...existing, itinerary];
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