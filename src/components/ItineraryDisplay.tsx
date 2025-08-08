import React from 'react';
import { Share2, Save, Download, MapPin, Calendar, DollarSign, Mail, MessageCircle, Send, Facebook, Edit, Heart, Clock, Users } from 'lucide-react';
import { Itinerary } from '../types';
import DayCard from './DayCard';
import { saveItinerary, shareItinerary } from '../utils/storage';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave: () => void;
  onEdit: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onSave, onEdit }) => {
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  const handleSave = () => {
    saveItinerary(itinerary);
    onSave();
    alert('Itinerary saved successfully!');
  };

  const getShareText = () => {
    const shareText = shareItinerary(itinerary);
    return shareText;
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleNativeShare = () => {
    const shareText = getShareText();
    if (navigator.share) {
      navigator.share({
        title: `Travel Itinerary for ${itinerary.destination}`,
        text: shareText,
        url: getShareUrl()
      }).catch(err => console.log('Error sharing:', err));
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const shareText = getShareText();
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Itinerary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const shareText = getShareText();
    const subject = `Travel Itinerary for ${itinerary.destination}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.open(mailtoUrl);
    setShowShareMenu(false);
  };

  const handleWhatsAppShare = () => {
    const shareText = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleTelegramShare = () => {
    const shareText = getShareText();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    const shareText = `Check out my travel itinerary for ${itinerary.destination}! 🌍✈️`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(facebookUrl, '_blank');
    setShowShareMenu(false);
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 0);
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
            <h1 className="text-4xl font-bold mb-4">{itinerary.destination}</h1>
            <p className="text-xl text-blue-100 mb-8">Your Perfect Travel Itinerary</p>
            
            <div className="flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{itinerary.days.length} Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{itinerary.totalBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.days.length}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.preferences.budget}</div>
              <div className="text-sm text-gray-600">Budget Level</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{itinerary.preferences.interests.length}</div>
              <div className="text-sm text-gray-600">Interests</div>
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
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
            >
              <Download className="h-5 w-5" />
              <span>Print</span>
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

      {/* Daily Itineraries */}
      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <DayCard key={day.day} dayItinerary={day} />
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