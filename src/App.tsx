import React, { useState, useEffect } from 'react';
import { useLocation } from './hooks/useLocation';
import Header from './components/Header';
import { TypingText } from './components/ui/TypingText';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LoadingSpinner from './components/LoadingSpinner';
import { FormData, Itinerary } from './types';
import { generateItinerary } from './utils/openai';
import { getItineraries } from './utils/storage';
import SharedItineraryView from './components/SharedItineraryView';

type AppState = 'form' | 'loading' | 'itinerary' | 'saved' | 'shared';

function App() {
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>('form');
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [fadeOutText, setFadeOutText] = useState(false);
  const [sharedItinerary, setSharedItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    setSavedItineraries(getItineraries());
    
    // Check if this is a shared itinerary URL
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const encodedData = path.replace('/share/', '');
      try {
        const decodedData = decodeURIComponent(atob(encodedData));
        const itineraryData = JSON.parse(decodedData);
        setSharedItinerary(itineraryData);
        setAppState('shared');
        setShowMainContent(true); // Skip the typing animation for shared links
      } catch (error) {
        console.error('Error decoding shared itinerary:', error);
        // If decoding fails, show normal form
        setAppState('form');
      }
    }
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
    console.log('handleFormSubmit called with:', formData);
    setLoading(true);
    setAppState('loading');
    
    try {
      console.log('Calling generateItinerary...');
      const itinerary = await generateItinerary(formData);
      console.log('Itinerary generated successfully:', itinerary);
      setCurrentItinerary(itinerary);
      setAppState('itinerary');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Sorry, there was an error generating your itinerary. Please try again.');
      setAppState('form');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = () => {
    // Refresh the saved itineraries list to update the count
    setSavedItineraries(getItineraries());
  };

  const handleViewSaved = () => {
    setSavedItineraries(getItineraries());
    setAppState('saved');
  };

  const handleViewItinerary = (itinerary: Itinerary) => {
    setCurrentItinerary(itinerary);
    setAppState('itinerary');
  };

  const handleBackToForm = () => {
    setCurrentItinerary(null);
    setAppState('form');
  };

  // Prevent page reload when print dialog is cancelled
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prevent unload if we're in itinerary view
      if (appState === 'itinerary' && currentItinerary) {
        e.preventDefault();
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      // Prevent back navigation from breaking the app state
      if (appState === 'itinerary' && currentItinerary) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [appState, currentItinerary]);
  const handleEditPlan = (itinerary: Itinerary) => {
    // Pre-populate form with existing itinerary data
    setCurrentItinerary(itinerary);
    setAppState('form');
  };

  const handleUpdateSaved = () => {
    console.log('Updating saved itineraries list...');
    setSavedItineraries(getItineraries());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header 
        onViewSaved={handleViewSaved}
        savedCount={savedItineraries.length}
      />
      
      <main className="container mx-auto px-4 py-8">
        {appState === 'form' && (
          <div className="space-y-8">
            {!showMainContent && (
              <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center z-50">
                <div className="text-center">
                  <h1 className={`text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 transition-opacity duration-1000 ${fadeOutText ? 'opacity-0' : 'opacity-100'}`}>
                    <TypingText 
                      className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      text="WanderAI"
                      cursor
                      cursorClassName="h-14 text-blue-600"
                      speed={100}
                      onComplete={() => setShowSubtitle(true)}
                    />
                  </h1>
                  {showSubtitle && (
                    <p className={`text-3xl text-gray-500 transition-opacity duration-1000 ${fadeOutText ? 'opacity-0' : 'opacity-100'}`}>
                      <TypingText 
                        className="text-3xl text-gray-500"
                        text="Your AI Travel Companion" 
                        cursor
                        cursorClassName="h-8 text-gray-400"
                        speed={100}
                        onComplete={() => {
                          setTimeout(() => {
                            setFadeOutText(true);
                            setTimeout(() => setShowMainContent(true), 1000);
                          }, 2000);
                        }}
                      />
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {showMainContent && (
              <div className="text-center mb-12 animate-fade-in opacity-0 animate-[fadeIn_1s_ease-in-out_forwards]">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  WanderAI
                </h1>
                <p className="text-xl text-gray-500 mb-8">Your AI Travel Companion</p>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Intelligent itinerary planning for unforgettable adventures. Hidden gems and must-see spots, perfectly tailored
                </p>
              </div>
            )}
            
            {showMainContent && (
              <div className="animate-fade-in opacity-0 animate-[fadeIn_1s_ease-in-out_forwards] delay-300">
                <TravelForm 
                  onSubmit={handleFormSubmit} 
                  loading={loading}
                  initialData={currentItinerary ? {
                    destinations: currentItinerary.destination.split(', '),
                    startDate: currentItinerary.startDate,
                    endDate: currentItinerary.endDate,
                    budget: currentItinerary.preferences.budget,
                    interests: currentItinerary.preferences.interests,
                    currency: 'USD' // Default currency, could be stored in itinerary
                  } : undefined}
                />
              </div>
            )}
          </div>
        )}

        {appState === 'loading' && <LoadingSpinner />}

        {appState === 'itinerary' && currentItinerary && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={handleBackToForm}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Plan Another Trip
              </button>
            </div>
            <ItineraryDisplay 
              itinerary={currentItinerary} 
              onSave={handleSaveItinerary}
              onEdit={() => handleEditPlan(currentItinerary)}
              onUpdate={setCurrentItinerary}
            />
          </div>
        )}

        {appState === 'saved' && (
          <SavedItineraries
            itineraries={savedItineraries}
            onBack={handleBackToForm}
            onView={handleViewItinerary}
            onUpdate={handleUpdateSaved}
          />
        )}

        {appState === 'shared' && sharedItinerary && (
          <SharedItineraryView
            itinerary={sharedItinerary}
            onPlanNewTrip={handleBackToForm}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 text-center">
          <p className="text-gray-600">
            Powered by AI • Made with ❤️ for travelers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;