import React, { useState, useEffect } from 'react';
import { useLocation } from './hooks/useLocation';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import { AuthModal } from './components/AuthModal';
import { TypingText } from './components/ui/TypingText';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LoadingSpinner from './components/LoadingSpinner';
import { FormData, Itinerary } from './types';
import { generateItinerary } from './utils/openai';
import { getItineraries } from './utils/storage';
import SharedItineraryView from './components/SharedItineraryView';
import { Dialog } from './components/ui/Dialog';
import { useDialog } from './hooks/useDialog';

type AppState = 'form' | 'loading' | 'itinerary' | 'saved' | 'shared';

function App() {
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('form');
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [fadeOutText, setFadeOutText] = useState(false);
  const [sharedItinerary, setSharedItinerary] = useState<Itinerary | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasGeneratedItinerary, setHasGeneratedItinerary] = useState(false);
  const { dialogState, showDialog, closeDialog } = useDialog();

  useEffect(() => {
    setSavedItineraries(getItineraries());
    
    // Check if this is a shared itinerary URL
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const encodedData = path.replace('/share/', '');
      try {
        // Try simple base64 decoding first
        let decodedData;
        try {
          decodedData = atob(encodedData);
        } catch {
          // Fallback to URL decoding if needed
          decodedData = decodeURIComponent(atob(encodedData));
        }
        
        const itineraryData = JSON.parse(decodedData);
        
        // Convert minimal data back to full itinerary format
        const reconstructedItinerary = {
          id: itineraryData.id || 'shared-' + Date.now(),
          destination: itineraryData.d || itineraryData.destination || 'Unknown Destination',
          startDate: itineraryData.s || itineraryData.startDate || '',
          endDate: itineraryData.e || itineraryData.endDate || '',
          preferences: {
            budget: itineraryData.b === 'B' ? 'Budget' : 
                    itineraryData.b === 'M' ? 'Mid-range' : 
                    itineraryData.b === 'L' ? 'Luxury' : 
                    itineraryData.b || itineraryData.budget || 'Mid-range',
            interests: itineraryData.i || itineraryData.interests || []
          },
          days: itineraryData.days ? 
            Array.from({ length: typeof itineraryData.days === 'number' ? itineraryData.days : itineraryData.dc || 1 }, (_, i) => ({
              day: i + 1,
              date: `Day ${i + 1}`,
              activities: [],
              totalEstimatedCost: 'Varies',
              notes: ''
            })) : 
            itineraryData.days || [],
          totalBudget: itineraryData.tb || itineraryData.totalBudget || 'Contact for details',
          createdAt: new Date().toISOString(),
          currency: 'USD'
        };
        
        setSharedItinerary(reconstructedItinerary);
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
    
    // Check if guest user has already generated an itinerary
    if (!isAuthenticated && hasGeneratedItinerary) {
      showDialog({
        title: 'Sign In Required',
        message: 'You can only generate one itinerary as a guest. Please sign in to generate more itineraries and save them.',
        type: 'warning'
      });
      setShowAuthModal(true);
      return;
    }
    
    setLoading(true);
    setAppState('loading');
    
    try {
      console.log('Calling generateItinerary...');
      const response = await generateItinerary(formData);
      console.log('Response received:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate itinerary');
      }
      
      const itinerary = response.data;
      console.log('Itinerary generated successfully:', itinerary);
      
      // If we're editing an existing itinerary, preserve the original ID
      const finalItinerary = currentItinerary ? {
        ...itinerary,
        id: currentItinerary.id,
        createdAt: currentItinerary.createdAt
      } : itinerary;
      
      setCurrentItinerary(finalItinerary);
      setHasGeneratedItinerary(true);
      setAppState('itinerary');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      showDialog({
        title: 'Generation Error',
        message: 'Sorry, there was an error generating your itinerary. Please try again.',
        type: 'error'
      });
      setAppState('form');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = () => {
    // Show auth modal if user is not authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Refresh the saved itineraries list to update the count
    setSavedItineraries(getItineraries());
  };

  const handleViewSaved = () => {
    // Show auth modal if user is not authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setSavedItineraries(getItineraries());
    setAppState('saved');
  };

  const handleViewItinerary = (itinerary: Itinerary) => {
    setCurrentItinerary(itinerary);
    setAppState('itinerary');
  };

  const handleEditItinerary = (itinerary: Itinerary) => {
    // Set the itinerary as current for editing
    setCurrentItinerary(itinerary);
    setAppState('form');
  };

  const handleBackToForm = () => {
    // Check if user is authenticated for "Plan Another Trip"
    if (!isAuthenticated && hasGeneratedItinerary) {
      setShowAuthModal(true);
      return;
    }
    
    // Clear current itinerary when going back to form for a new trip
    setCurrentItinerary(null);
    // Reset the generation flag when going back to form
    setHasGeneratedItinerary(false);
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

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // Refresh saved itineraries after successful auth
    setSavedItineraries(getItineraries());
    // Close the auth modal
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-white to-indigo-25 overflow-x-hidden" style={{
      background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.9), #ffffff, rgba(238, 242, 255, 0.9))'
    }}>
      <Header 
        onViewSaved={handleViewSaved}
        savedCount={savedItineraries.length}
        onShowAuth={handleShowAuth}
      />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {appState === 'form' && (
          <div className="space-y-8">
            {!showMainContent && (
              <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center z-50 px-4">
                <div className="text-center max-w-sm sm:max-w-none">
                  <h1 className={`text-4xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 transition-opacity duration-1000 ${fadeOutText ? 'opacity-0' : 'opacity-100'}`}>
                    <TypingText 
                      className="text-4xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      text="WanderAI"
                      cursor
                      cursorClassName="h-8 sm:h-14 text-blue-600"
                      speed={100}
                      onComplete={() => setShowSubtitle(true)}
                    />
                  </h1>
                  {showSubtitle && (
                    <p className={`text-xl sm:text-3xl text-gray-500 transition-opacity duration-1000 ${fadeOutText ? 'opacity-0' : 'opacity-100'}`}>
                      <TypingText 
                        className="text-xl sm:text-3xl text-gray-500"
                        text="Your AI Travel Companion" 
                        cursor
                        cursorClassName="h-6 sm:h-8 text-gray-400"
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
              <div className="text-center mb-8 sm:mb-12 animate-fade-in opacity-0 animate-[fadeIn_1s_ease-in-out_forwards] px-4">
                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  WanderAI
                </h1>
                <p className="text-lg sm:text-xl text-gray-500 mb-6 sm:mb-8">Your AI Travel Companion</p>
                <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                  Intelligent itinerary planning for unforgettable adventures. Hidden gems and must-see spots, perfectly tailored
                </p>
                {!isAuthenticated && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
                    <p className="text-sm text-blue-700">
                      <strong>Guest Mode:</strong> You can generate one free itinerary. Sign in to create unlimited itineraries and save them for later.
                    </p>
                  </div>
                )}
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
                className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base px-4 py-2"
              >
                ← Plan Another Trip
              </button>
            </div>
            <ItineraryDisplay 
              itinerary={currentItinerary} 
              onSave={handleSaveItinerary}
              onEdit={() => handleEditPlan(currentItinerary)}
              onUpdate={setCurrentItinerary}
              currency={currentItinerary.currency || 'USD'}
            />
          </div>
        )}

        {appState === 'saved' && (
          <SavedItineraries
            itineraries={savedItineraries}
            onBack={handleBackToForm}
            onView={handleViewItinerary}
            onEdit={handleEditItinerary}
            onUpdate={handleUpdateSaved}
            defaultCurrency="USD"
          />
        )}

        {appState === 'shared' && sharedItinerary && (
          <SharedItineraryView
            itinerary={sharedItinerary}
            onPlanNewTrip={handleBackToForm}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Dialog Modal */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
        onConfirm={dialogState.onConfirm}
      />

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Powered by AI • Made with ❤️ for travelers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;