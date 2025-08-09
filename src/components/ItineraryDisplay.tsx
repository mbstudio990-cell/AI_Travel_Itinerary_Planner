import React from 'react';
import { Share2, Save, Download, MapPin, Calendar, DollarSign, Mail, MessageCircle, Send, Facebook, Edit, Heart, Clock, Users, FileDown, BookOpen, Settings } from 'lucide-react';
import { Itinerary } from '../types';
import DayCard from './DayCard';
import { saveItinerary, shareItinerary, updateItineraryNotes } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';
import { TravelSummaryModal } from './TravelSummaryModal';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave: () => void;
  onEdit: () => void;
  onUpdate?: (updatedItinerary: Itinerary) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onSave, onEdit, onUpdate }) => {
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [currentItinerary, setCurrentItinerary] = React.useState(itinerary);
  const [showTravelSummary, setShowTravelSummary] = React.useState(false);
  const [showActivitySelection, setShowActivitySelection] = React.useState(false);

  // Update current itinerary when prop changes
  React.useEffect(() => {
    setCurrentItinerary(itinerary);
  }, [itinerary]);

  const handleSave = () => {
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
  };

  const handleActivityToggle = (dayNumber: number, activity: Activity) => {
    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(day => 
        day.day === dayNumber 
          ? {
              ...day,
              activities: day.activities.map(act => 
                act.title === activity.title && act.time === activity.time
                  ? { ...act, selected: activity.selected }
                  : act
              )
            }
          : day
      )
    };
    
    setCurrentItinerary(updatedItinerary);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedItinerary);
    }
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
    // Create a more compact shareable link with essential data only
    const compactData = {
      d: itinerary.destination,
      s: itinerary.startDate,
      e: itinerary.endDate,
      b: itinerary.preferences.budget,
      i: itinerary.preferences.interests.slice(0, 3), // Limit interests
      days: itinerary.days.map(day => ({
        d: day.day,
        dt: day.date.split(',')[0], // Shorter date format
        c: day.totalEstimatedCost,
        a: day.activities.slice(0, 3).map(act => ({ // Limit activities
          t: act.time,
          n: act.title.substring(0, 50), // Truncate title
          l: act.location.substring(0, 40), // Truncate location
          c: act.costEstimate,
          cat: act.category
        }))
      }))
    };
    
    try {
      const jsonString = JSON.stringify(compactData);
      // Check if the data is still too large
      if (jsonString.length > 1500) {
        // Create an even more minimal version
        const minimalData = {
          d: itinerary.destination,
          s: itinerary.startDate,
          e: itinerary.endDate,
          b: itinerary.preferences.budget,
          days: itinerary.days.length,
          budget: itinerary.totalBudget
        };
        const encodedData = btoa(encodeURIComponent(JSON.stringify(minimalData)));
        const baseUrl = window.location.origin;
        return `${baseUrl}/share/${encodedData}`;
      }
      
      const encodedData = btoa(encodeURIComponent(jsonString));
      const baseUrl = window.location.origin;
      return `${baseUrl}/share/${encodedData}`;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      // Fallback to minimal data
      const fallbackData = {
        destination: itinerary.destination,
        days: itinerary.days.length,
        budget: itinerary.totalBudget
      };
      const encodedData = btoa(encodeURIComponent(JSON.stringify(fallbackData)));
      const baseUrl = window.location.origin;
      return `${baseUrl}/share/${encodedData}`;
    }
  };

  const handleWhatsAppShare = () => {
    const shareableLink = createShareableLink(currentItinerary);
    // Create a shorter message for WhatsApp
    const shareText = `🌍 Check out my ${currentItinerary.destination} travel plan!\n${shareableLink}`;
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
    const shareText = `🌍 Check out my ${currentItinerary.destination} travel itinerary!\n\n${shareableLink}`;
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
    const shareText = `Check out my travel itinerary for ${currentItinerary.destination}!\n\nView the full itinerary: ${shareableLink}`;
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{currentItinerary.destination}</h1>
            <p className="text-xl text-blue-100 mb-8">Your Perfect Travel Itinerary</p>
            
            <div className="flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(currentItinerary.startDate).toLocaleDateString()} - {new Date(currentItinerary.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{currentItinerary.days.length} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{currentItinerary.totalBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentItinerary.days.length}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentItinerary.preferences.budget}</div>
              <div className="text-sm text-gray-600">Budget Level</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentItinerary.preferences.interests.length}</div>
              <div className="text-sm text-gray-600">Interests</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowTravelSummary(true)}
                className="flex flex-col items-center justify-center w-full h-full p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl mb-3 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Travel Summary</div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Plan</span>
            </button>
            
            <button
              onClick={() => setShowActivitySelection(!showActivitySelection)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors font-medium ${
                showActivitySelection
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>{showActivitySelection ? 'Done Customizing' : 'Customize Activities'}</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
            >
              <Save className="h-5 w-5" />
              <span>Save</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium relative z-10"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>

              {showShareMenu && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] overflow-hidden"
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
                     className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    
                    <button
                      onClick={handleTelegramShare}
                     className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Send className="h-4 w-4 text-white" />
                      </div>
                      <span>Telegram</span>
                    </button>
                    
                    <button
                      onClick={handleEmailShare}
                     className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <span>Email</span>
                    </button>
                    
                    <button
                      onClick={handleCopyLink}
                     className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 text-gray-700 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                        <Share2 className="h-4 w-4 text-white" />
                      </div>
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
            >
              <FileDown className="h-5 w-5" />
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
      <div className="space-y-6">
        {currentItinerary.days.map((day) => (
          <DayCard 
            key={day.day} 
            dayItinerary={day} 
            itineraryId={currentItinerary.id}
            onSaveNotes={handleSaveNotes}
            onActivityToggle={handleActivityToggle}
            showActivitySelection={showActivitySelection}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <span className="text-2xl">🌟</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Have an Amazing Trip!</h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your personalized AI-generated itinerary is ready. Don't forget to save it and share with your travel companions for an unforgettable adventure!
        </p>
      </div>
    </div>
  );
};

export default ItineraryDisplay;