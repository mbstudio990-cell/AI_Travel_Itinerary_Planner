import React, { useState, useEffect } from 'react';
import { Calendar, Banknote, ChevronDown, ChevronUp, MapPin, FileText, Edit3, Plus, Lightbulb, Clock, Settings } from 'lucide-react';
import { DayItinerary, Activity } from '../types';
import ActivityCard from './ActivityCard';
import { AddActivityModal } from './AddActivityModal';
import { NotesModal } from './NotesModal';
import { loadItineraryNotes } from '../utils/storage';

interface DayCardProps {
  dayItinerary: DayItinerary;
  itineraryId?: string;
  destination?: string;
  budget?: string;
  currency?: string;
  onSaveNotes?: (dayNumber: number, notes: string) => void;
  onToggleActivity?: (dayNumber: number, activity: Activity) => void;
}

const getLocationSpecificImage = (activity: Activity): string => {
  // Extract location and activity details for more specific image search
  const location = activity.location.toLowerCase();
  const title = activity.title.toLowerCase();
  const category = activity.category.toLowerCase();
  
  // Location-specific images based on common destinations and landmarks
  const locationImages = {
    // Major Cities
    'paris': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
    'london': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    'tokyo': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'new york': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'rome': 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400',
    'barcelona': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'amsterdam': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'istanbul': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'dubai': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=400',
    'singapore': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bangkok': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mumbai': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'delhi': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'goa': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sydney': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'melbourne': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bali': 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400',
    'phuket': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'santorini': 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mykonos': 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400',
    'venice': 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
    'florence': 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
    'prague': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vienna': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'budapest': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'lisbon': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'madrid': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'berlin': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'munich': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'zurich': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'stockholm': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'copenhagen': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'oslo': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'helsinki': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'reykjavik': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cairo': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'marrakech': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cape town': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'nairobi': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'rio de janeiro': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'buenos aires': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'lima': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cusco': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'machu picchu': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vancouver': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'toronto': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'montreal': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'los angeles': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'san francisco': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'las vegas': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'chicago': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'miami': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'washington': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'boston': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'seattle': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
  };
  
  // Activity-specific images based on title keywords
  const activityImages = {
    // Museums and Cultural Sites
    'museum': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gallery': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'louvre': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'moma': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'guggenheim': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'vatican': 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sistine chapel': 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400',
    'colosseum': 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400',
    'eiffel tower': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
    'notre dame': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
    'arc de triomphe': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
    'big ben': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    'tower bridge': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    'buckingham palace': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    'statue of liberty': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'empire state': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'times square': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'central park': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'brooklyn bridge': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'golden gate': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'hollywood': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sagrada familia': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'park guell': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'alhambra': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    'taj mahal': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'red fort': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'india gate': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gateway of india': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'marine drive': 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=400',
    'tokyo tower': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'shibuya': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'senso-ji': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'meiji shrine': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'tsukiji': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'harajuku': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    'opera house': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'harbour bridge': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bondi beach': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'blue mosque': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'hagia sophia': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'grand bazaar': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'topkapi palace': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bosphorus': 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=400',
    'burj khalifa': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=400',
    'burj al arab': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=400',
    'dubai mall': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=400',
    'palm jumeirah': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=400',
    'marina bay': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gardens by the bay': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'merlion': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sentosa': 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg?auto=compress&cs=tinysrgb&w=400',
    
    // Food and Dining
    'restaurant': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cafe': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'market': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'food tour': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'street food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cooking class': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'wine tasting': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'brewery': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'rooftop': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    
    // Nature and Outdoor
    'park': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'garden': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'beach': 'https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg?auto=compress&cs=tinysrgb&w=400',
    'hiking': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mountain': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'lake': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'river': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'waterfall': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sunset': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sunrise': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'viewpoint': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'botanical': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    
    // Adventure and Activities
    'cruise': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'boat': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'sailing': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'diving': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'snorkeling': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'cycling': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bike tour': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'walking tour': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'photography': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'zip line': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bungee': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'skydiving': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    
    // Shopping and Entertainment
    'shopping': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mall': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'boutique': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'souvenir': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'nightlife': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'bar': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'club': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'theater': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'concert': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'show': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'performance': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
  };
  
  // First, try to match specific locations
  for (const [locationKey, imageUrl] of Object.entries(locationImages)) {
    if (location.includes(locationKey)) {
      return imageUrl;
    }
  }
  
  // Then, try to match activity titles or keywords
  for (const [activityKey, imageUrl] of Object.entries(activityImages)) {
    if (title.includes(activityKey) || location.includes(activityKey)) {
      return imageUrl;
    }
  }
  
  // Finally, fall back to category-based images
  const images = {
    'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    'culture': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'nature': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'adventure': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    'shopping': 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=400',
    'history': 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400',
    'art': 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    'default': 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return images[category as keyof typeof images] || images.default;
};

const DayCard: React.FC<DayCardProps> = ({ 
  dayItinerary, 
  itineraryId, 
  destination = '',
  budget = 'Mid-range',
  currency = 'USD',
  onSaveNotes,
  onToggleActivity,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(dayItinerary.notes || '');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [hasBeenCustomized, setHasBeenCustomized] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  // Helper function to parse time and sort activities chronologically
  const parseTimeForSorting = (timeString: string): number => {
    // Extract the start time from ranges like "9:00 AM - 11:30 AM" or single times like "9:00 AM"
    const startTime = timeString.split(' - ')[0].trim();
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    return hour24 * 60 + minutes; // Convert to minutes for easy sorting
  };

  // Sort activities by time
  const sortActivitiesByTime = (activities: Activity[]) => {
    return [...activities].sort((a, b) => {
      const timeA = parseTimeForSorting(a.time);
      const timeB = parseTimeForSorting(b.time);
      return timeA - timeB;
    });
  };

  // Helper function to categorize activities by time ranges
  const categorizeByTimeRange = (activities: Activity[]) => {
    const timeRanges = {
      'Early Morning (6:00-9:00 AM)': [],
      'Morning (9:00 AM-12:00 PM)': [],
      'Lunch Time (12:00-2:00 PM)': [],
      'Afternoon (2:00-5:00 PM)': [],
      'Evening (5:00-8:00 PM)': [],
      'Night (8:00 PM-Late)': []
    };

    activities.forEach(activity => {
      const time = activity.time.toLowerCase();
      if (time.includes('6:') || time.includes('7:') || (time.includes('8:') && time.includes('am'))) {
        timeRanges['Early Morning (6:00-9:00 AM)'].push(activity);
      } else if (time.includes('9:') || time.includes('10:') || (time.includes('11:') && time.includes('am'))) {
        timeRanges['Morning (9:00 AM-12:00 PM)'].push(activity);
      } else if (time.includes('12:') || (time.includes('1:') && time.includes('pm'))) {
        timeRanges['Lunch Time (12:00-2:00 PM)'].push(activity);
      } else if (time.includes('2:') || time.includes('3:') || (time.includes('4:') && time.includes('pm'))) {
        timeRanges['Afternoon (2:00-5:00 PM)'].push(activity);
      } else if (time.includes('5:') || time.includes('6:') || (time.includes('7:') && time.includes('pm'))) {
        timeRanges['Evening (5:00-8:00 PM)'].push(activity);
      } else {
        timeRanges['Night (8:00 PM-Late)'].push(activity);
      }
    });

    // Filter out empty time ranges and sort activities within each range
    const filteredRanges = {};
    Object.entries(timeRanges).forEach(([range, activities]) => {
      if (activities.length > 0) {
        filteredRanges[range] = sortActivitiesByTime(activities);
      }
    });

    return filteredRanges;
  };

  // Load notes from Supabase when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      if (itineraryId) {
        try {
          const notesMap = await loadItineraryNotes(itineraryId);
          const dayNotes = notesMap[dayItinerary.day];
          if (dayNotes) {
            setCurrentNotes(dayNotes);
          }
        } catch (error) {
          console.warn('Error loading notes for day:', error);
        }
      }
    };

    loadNotes();
  }, [itineraryId, dayItinerary.day]);

  // Track if activities have been customized
  useEffect(() => {
    const hasUnselectedActivities = dayItinerary.activities.some(activity => activity.selected === false);
    if (hasUnselectedActivities) {
      setHasBeenCustomized(true);
    }
  }, [dayItinerary.activities]);

  // In manage mode, show all activities if never customized, otherwise show only selected
  // In view mode, always show only selected activities
  const currentIsManageMode = isManageMode;
  const displayActivities = dayItinerary.activities.filter(activity => activity.selected !== false);
  const activitiesByTimeRange = categorizeByTimeRange(displayActivities);
  
  const toggleActivity = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActivities(newExpanded);
  };

  const handleSaveNotes = async (dayNumber: number, notes: string) => {
    setCurrentNotes(notes);
    if (onSaveNotes) {
      await onSaveNotes(dayNumber, notes);
    }
  };

  const handleToggleActivity = (activity: Activity) => {
    if (onToggleActivity) {
      onToggleActivity(dayItinerary.day, activity);
    }
  };

  const handleToggleManageMode = () => {
    const newManageMode = !isManageMode;
    setIsManageMode(newManageMode);
    
    // If exiting manage mode (clicking Done), remove unselected activities
    if (!newManageMode && isManageMode) {
      // This will be handled by the parent component through onToggleActivity
      // We just need to notify that we're done managing
    }
  };

  // Use current notes state instead of dayItinerary.notes
  const displayNotes = currentNotes || dayItinerary.notes;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 hover:scale-[1.02] transition-all duration-300">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 rounded-2xl w-20 h-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wide">Day</div>
                <div className="text-2xl font-bold text-white">{dayItinerary.day}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-white" />
                <h3 className="text-xl font-bold text-white">{dayItinerary.date}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-white" />
                <span className="text-white font-semibold">Est. {dayItinerary.totalEstimatedCost}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notes Button */}
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                displayNotes 
                  ? 'bg-yellow-400/30 hover:bg-yellow-400/40 text-white' 
                  : 'hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title="Take Notes"
            >
              {displayNotes ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </button>
            
            <div className="text-right">
              <div className="text-sm text-white font-medium mb-1">Activities</div>
              <div className="text-xl font-bold text-white">
                {isInManageMode 
                  ? `${dayItinerary.activities.filter(a => a.selected !== false).length}/${dayItinerary.activities.length}`
                  : displayActivities.length
                }
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              aria-label={isExpanded ? "Collapse activities" : "Expand activities"}
            >
              {isExpanded ? (
                <ChevronUp className="h-6 w-6 text-white" />
              ) : (
                <ChevronDown className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

        {/* Notes Preview */}
        {displayNotes && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mt-1 shadow-sm">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Your Experience</h4>
                <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                  {displayNotes.length > 150 
                    ? `${displayNotes.substring(0, 150)}...` 
                    : displayNotes
                  }
                </p>
                <button
                  onClick={() => setIsNotesModalOpen(true)}
                  className="text-xs text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-gray-200 font-medium mt-1 hover:underline transition-all duration-200"
                >
                  {displayNotes.length > 150 ? 'Read more' : 'Edit notes'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Activities List */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-between w-full">
              <div>
               {currentIsManageMode ? (
                  <p className="text-indigo-600 font-semibold">
                    {dayItinerary.activities.filter(a => a.selected !== false).length} of {dayItinerary.activities.length} activities selected
                  </p>
                ) : (
                  <p className="text-indigo-600 font-semibold">
                    {displayActivities.length} activities planned for this day
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isManageMode
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>{isManageMode ? 'Done' : 'Customize'}</span>
                </button>
                
                {isManageMode && (
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Activity</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {currentIsManageMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Customize Mode:</strong> Check the boxes to add activities to your itinerary, uncheck to remove them. Green border = selected, gray = not selected.
              </p>
            </div>
          )}
          
          {(currentIsManageMode ? dayItinerary.activities : displayActivities).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activities planned</h4>
              <p className="text-gray-600 mb-4">Add some activities to make this day amazing!</p>
              {currentIsManageMode && (
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Activity</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Time Range Groups */}
              {Object.entries(activitiesByTimeRange).map(([timeRange, activities], rangeIndex) => (
                <div key={timeRange} className="mb-8">
                  {/* Time Range Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-sm">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">{timeRange}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">{activities.length} activities</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-blue-600 font-medium">
                          {activities.reduce((total, activity) => {
                            const cost = activity.costEstimate.toLowerCase();
                            if (cost.includes('free')) return total;
                            const match = cost.match(/[\d,]+/);
                            return total + (match ? parseInt(match[0]) : 0);
                          }, 0) > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Banknote className="h-3 w-3" />
                              <span>{activities.reduce((total, activity) => {
                                const cost = activity.costEstimate.toLowerCase();
                                if (cost.includes('free')) return total;
                                const match = cost.match(/[\d,]+/);
                                return total + (match ? parseInt(match[0]) : 0);
                              }, 0)}</span>
                            </div>
                          ) : 'Free activities'
                        }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activities in this time range */}
                  <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-6">
                    {activities.map((activity, activityIndex) => {
                      const globalIndex = rangeIndex * 100 + activityIndex; // Create unique index
                      return (
                        <div key={globalIndex} className="relative">
                          {/* Timeline Dot */}
                          <div className="absolute -left-8 top-4">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              activity.selected !== false 
                                ? 'bg-blue-600 border-blue-600 shadow-sm' 
                                : 'bg-gray-300 border-gray-300'
                            }`}></div>
                          </div>

                          {/* Activity Card */}
                          <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                            activity.selected !== false 
                              ? 'border-blue-200 hover:border-blue-300' 
                              : 'border-gray-200 opacity-75'
                          }`}>
                            {/* Activity Image */}
                            <div className="relative h-32 overflow-hidden rounded-lg mb-4">
                              <img
                                src={getLocationSpecificImage(activity)}
                                alt={activity.title}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                              
                              {/* Category Badge Overlay */}
                              <div className="absolute top-2 left-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium text-white shadow-lg ${
                                  activity.category === 'Culture' ? 'bg-purple-600' :
                                  activity.category === 'Food' ? 'bg-orange-600' :
                                  activity.category === 'Nature' ? 'bg-green-600' :
                                  activity.category === 'Adventure' ? 'bg-red-600' :
                                  activity.category === 'Shopping' ? 'bg-pink-600' :
                                  'bg-blue-600'
                                }`}>
                                  {activity.category}
                                </span>
                              </div>

                              {/* Cost Badge Overlay */}
                              <div className="absolute top-2 right-2">
                                <div className="bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
                                  <span className="text-xs font-semibold text-green-700">{activity.costEstimate}</span>
                                </div>
                              </div>

                              {/* Manage Checkbox Overlay */}
                              {currentIsManageMode && (
                                <div className="absolute bottom-2 right-2">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleActivity(activity);
                                    }}
                                    className="flex items-center justify-center cursor-pointer"
                                    title={activity.selected !== false ? "Remove from itinerary" : "Add to itinerary"}
                                  >
                                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
                                      activity.selected !== false
                                        ? 'bg-green-500 bg-opacity-95 border-green-500 hover:bg-green-600 hover:border-green-600 shadow-lg'
                                        : 'border-white bg-white bg-opacity-90 hover:border-green-400 bg-white'
                                    }`}>
                                      {activity.selected !== false && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Activity Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                {/* Time and Category */}
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                                    <span className="text-sm font-semibold text-blue-700">{activity.time}</span>
                                  </div>
                                </div>

                                {/* Activity Title */}
                                <h5 className="font-bold text-gray-900 text-lg mb-2">{activity.title}</h5>
                                
                                {/* Location */}
                                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
                                    title="Open in Google Maps"
                                  >
                                    <MapPin className="h-4 w-4 group-hover:text-blue-600" />
                                    <span className="text-sm group-hover:text-blue-600">{activity.location}</span>
                                  </a>
                                </div>
                              </div>

                              {/* Cost and Manage Controls */}
                              <div className="flex items-center space-x-3">

                                {/* Manage Checkbox */}
                                {currentIsManageMode && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleActivity(activity);
                                    }}
                                    className="flex items-center justify-center cursor-pointer"
                                    title={activity.selected !== false ? "Remove from itinerary" : "Add to itinerary"}
                                  >
                                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                      activity.selected !== false
                                        ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                                        : 'border-gray-300 hover:border-green-400 bg-white'
                                    }`}>
                                      {activity.selected !== false && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Activity Description */}
                            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{activity.description}</p>

                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => toggleActivity(globalIndex)}
                              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm"
                            >
                              <span>{expandedActivities.has(globalIndex) ? 'Hide Details' : 'Show Tips & Details'}</span>
                              {expandedActivities.has(globalIndex) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>

                            {/* Expanded Details */}
                            {expandedActivities.has(globalIndex) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-amber-100 p-2 rounded-lg">
                                      <Lightbulb className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                      <h6 className="font-semibold text-amber-800 mb-2 text-sm">💡 Pro Tip</h6>
                                      <p className="text-amber-700 leading-relaxed text-sm">{activity.tips}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Empty state if no activities */}
              {Object.keys(activitiesByTimeRange).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No activities scheduled</h4>
                  <p className="text-gray-600">All activities have been removed or none are selected.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        onAddActivity={(activity) => {
          if (onToggleActivity) {
            onToggleActivity(dayItinerary.day, activity);
          }
        }}
        dayNumber={dayItinerary.day}
        destination={destination}
        budget={budget}
        currency={currency}
        existingActivities={dayItinerary.activities}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        dayItinerary={{ ...dayItinerary, notes: currentNotes }}
        onSaveNotes={handleSaveNotes}
      />
    </>
  );
};

export default DayCard;