import React from 'react';
import { Share2, Save, Download, MapPin, Calendar, Banknote, Mail, MessageCircle, Send, Facebook, Edit, Heart, Clock, Users, FileDown, BookOpen, Settings, CheckCircle } from 'lucide-react';
import { Itinerary } from '../types';
import DayCard from './DayCard';
import { saveItinerary, shareItinerary, updateItineraryNotes, getItineraries } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';
import { TravelSummaryModal } from './TravelSummaryModal';
import { useAuth } from '../hooks/useAuth';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave: () => void;
  onEdit: () => void;
  onUpdate?: (updatedItinerary: Itinerary) => void;
  currency?: string;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onSave, onEdit, onUpdate, currency }) => {
  const { isAuthenticated } = useAuth();
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [currentItinerary, setCurrentItinerary] = React.useState(itinerary);
  const [showTravelSummary, setShowTravelSummary] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  // Update current itinerary when prop changes
  React.useEffect(() => {
    setCurrentItinerary(itinerary);
  }, [itinerary]);

  // Auto-save function
  const autoSaveItinerary = React.useCallback(async (updatedItinerary: Itinerary) => {
    setAutoSaveStatus('saving');
    try {
      // Check if this itinerary exists in saved itineraries
      const savedItineraries = getItineraries();
      const existingItinerary = savedItineraries.find(saved => saved.id === updatedItinerary.id);
      
      if (existingItinerary) {
        // Auto-save if it's already saved
        saveItinerary(updatedItinerary);
        setAutoSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('idle');
    }
  }, []);
  const handleSave = () => {
    // Check if user is authenticated before saving
    if (!isAuthenticated) {
      alert('Please sign in to save your itinerary.');
      return;
    }
    
    saveItinerary(currentItinerary);
    onSave();
    alert('Itinerary saved successfully!');
  };

  const handleSaveNotes = (dayNumber: number, notes: string) => {
    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(day => 
        day.day === dayNumber 
          ? { ...day, notes }
          : day
      )
    };
    
    setCurrentItinerary(updatedItinerary);
    
    // Update in storage if it's a saved itinerary
    updateItineraryNotes(updatedItinerary.id, dayNumber, notes).catch(error => {
      console.error('Error saving notes:', error);
      // You might want to show a user-friendly error message here
    });
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedItinerary);
    }

    // Auto-save the itinerary
    autoSaveItinerary(updatedItinerary);
  };

  const handleToggleActivity = (dayNumber: number, activity: Activity) => {
    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(day => 
        day.day === dayNumber 
          ? {
              ...day,
              activities: (() => {
                // Handle batch removal of unselected activities
                if (activity.batchRemove && activity.selectedActivities) {
                  return activity.selectedActivities;
                }
                
                // If activity has remove flag, completely remove it
                if (activity.remove) {
                  return day.activities.filter(act => 
                    !(act.title === activity.title && act.time === activity.time)
                  );
                }
                
                const existingActivityIndex = day.activities.findIndex(act => 
                  act.title === activity.title && act.time === activity.time
                );
                
                if (existingActivityIndex !== -1) {
                  // Toggle existing activity
                  return day.activities.map((act, index) => 
                    index === existingActivityIndex
                      ? { ...act, selected: act.selected === false ? true : false }
                      : act
                  );
                } else {
                  // Add new activity
                  return [...day.activities, { ...activity, selected: true }];
                }
              })()
            }
          : day
      )
    };
    
    setCurrentItinerary(updatedItinerary);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedItinerary);
    }

    // Auto-save the itinerary
    autoSaveItinerary(updatedItinerary);
  };

  const getShareText = () => {
    const shareText = shareItinerary(currentItinerary);
    return shareText;
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleNativeShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    const shareText = `Check out my travel itinerary for ${currentItinerary.destination}! 🌍✈️`;
    if (navigator.share) {
      navigator.share({
        title: `Travel Itinerary for ${currentItinerary.destination}`,
        text: shareText,
        url: shareableLink
      }).catch(err => console.log('Error sharing:', err));
    }
    setShowShareMenu(false);
  };

  const createShareableLink = (itinerary: Itinerary): string => {
    // Create a very minimal shareable link to avoid URL length limits
    const minimalData = {
      d: itinerary.destination.substring(0, 30), // Limit destination length
      s: itinerary.startDate,
      e: itinerary.endDate,
      b: itinerary.preferences.budget,
      i: itinerary.preferences.interests.slice(0, 2), // Only 2 interests
      dc: itinerary.days.length, // Just day count
      tb: itinerary.totalBudget.substring(0, 20), // Limit budget text
      id: itinerary.id.substring(0, 8) // Short ID for reference
    };
    
    try {
      const jsonString = JSON.stringify(minimalData);
      
      // Use a simple base64 encoding without URL encoding to keep it shorter
      const encodedData = btoa(jsonString);
      const baseUrl = window.location.origin;
      
      // Check if URL is too long (most browsers/services limit to ~2000 chars)
      const fullUrl = `${baseUrl}/share/${encodedData}`;
      if (fullUrl.length > 1800) {
        // Fallback to even more minimal data
        const ultraMinimal = {
          d: itinerary.destination.substring(0, 20),
          days: itinerary.days.length,
          b: itinerary.preferences.budget.charAt(0) // Just first letter
        };
        const ultraEncoded = btoa(JSON.stringify(ultraMinimal));
        return `${baseUrl}/share/${ultraEncoded}`;
      }
      
      return fullUrl;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      // Ultimate fallback - just basic info
      const fallbackData = {
        d: itinerary.destination.substring(0, 15),
        days: itinerary.days.length,
        b: itinerary.preferences.budget.charAt(0)
      };
      const encodedData = btoa(JSON.stringify(fallbackData));
      const baseUrl = window.location.origin;
      return `${baseUrl}/share/${encodedData}`;
    }
  };

  const handleWhatsAppShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    // Create a very short message for WhatsApp to avoid issues
    const shareText = `🌍 ${currentItinerary.destination} travel plan: ${shareableLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleTelegramShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    const shareText = `🌍 ${currentItinerary.destination} travel itinerary`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    const shareText = `🌍 My ${currentItinerary.destination} travel itinerary`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableLink)}`;
    window.open(twitterUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const shareableLink = createShareableLink(currentItinerary);
    const shareText = `🌍 ${currentItinerary.destination} travel itinerary: ${shareableLink}`;
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Itinerary link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Itinerary link copied to clipboard!');
    }
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    const shareText = `${currentItinerary.destination} travel itinerary: ${shareableLink}`;
    const subject = `${currentItinerary.destination} Travel Itinerary`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.open(mailtoUrl);
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
    window.open(facebookUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(currentItinerary);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Sorry, there was an error generating the PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mx-4 sm:mx-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-8 sm:py-12 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4 sm:mb-6">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">{currentItinerary.destination}</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">Your Perfect Travel Itinerary</p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-blue-100 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{new Date(currentItinerary.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(currentItinerary.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{currentItinerary.days.length} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{currentItinerary.totalBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl mb-2 sm:mb-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{currentItinerary.days.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl mb-2 sm:mb-3">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{currentItinerary.preferences.budget}</div>
              <div className="text-xs sm:text-sm text-gray-600">Budget Level</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl mb-2 sm:mb-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="text-sm sm:text-base font-bold text-gray-900 px-2">
                {currentItinerary.preferences.interests.slice(0, 2).join(', ')}
                {currentItinerary.preferences.interests.length > 2 && ` +${currentItinerary.preferences.interests.length - 2} more`}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Selected Interests</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowTravelSummary(true)}
                className="flex flex-col items-center justify-center w-full h-full p-3 sm:p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl mb-2 sm:mb-3 transition-colors">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Travel Notes</div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          {/* Auto-save Status */}
          {autoSaveStatus !== 'idle' && (
            <div className="flex justify-center mb-4">
              <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
                autoSaveStatus === 'saving' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {autoSaveStatus === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-600"></div>
                    <span>Auto-saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Auto-saved!</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              onClick={onEdit}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Edit Plan</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Save</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium relative z-10 text-sm sm:text-base"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Share</span>
              </button>

              {showShareMenu && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] overflow-hidden"
                  style={{ 
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 99999
                  }}
                >
                  <div className="py-2">
                    <button
                      onClick={handleWhatsAppShare}
                     className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 sm:space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    
                    <button
                      onClick={handleTelegramShare}
                     className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 sm:space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span>Telegram</span>
                    </button>
                    
                    <button
                      onClick={handleEmailShare}
                     className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 sm:space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span>Email</span>
                    </button>
                    
                    <button
                      onClick={handleCopyLink}
                     className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 sm:space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base"
            >
              <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-[99998] bg-black bg-opacity-10" 
          onClick={() => setShowShareMenu(false)}
        />
      )}

      {/* Travel Summary Modal */}
      <TravelSummaryModal
        isOpen={showTravelSummary}
        onClose={() => setShowTravelSummary(false)}
        itinerary={currentItinerary}
      />

      {/* Daily Itineraries */}
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {currentItinerary.days.map((day) => (
          <DayCard 
            key={day.day} 
            dayItinerary={day} 
            itineraryId={currentItinerary.id}
            destination={currentItinerary.destination}
            budget={currentItinerary.preferences.budget}
            currency={currency}
            onSaveNotes={handleSaveNotes}
            onToggleActivity={handleToggleActivity}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 text-center mx-4 sm:mx-0">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6">
          <span className="text-2xl">🌟</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Have an Amazing Trip!</h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your personalized AI-generated itinerary is ready. Don't forget to save it and share with your travel companions for an unforgettable adventure!
        </p>
      </div>
    </div>
  );
};

export default ItineraryDisplay;