"use client";

import { useState, useEffect } from "react";
import AddMeetingPopup from "./AddMeetingPopup";
import TrashCanPopup from "./TrashCanPopup"; // Import the new component
import Spinner from './ui/Spinner';
import { signIn } from "next-auth/react";

const CalendarIcon = ({ type }) => {
  switch (type) {
    case 'google':
      return <span className="text-red-500">📅</span>;
    case 'outlook':
      return <span className="text-blue-500">📅</span>;
    default:
      return <span>📅</span>;
  }
};

export default function Sidebar({ darkMode, onShowMeetingDetails, session, deletedMeetings, setDeletedMeetings }) {
  const [topSectionHeight, setTopSectionHeight] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysForward, setDaysForward] = useState(60);
  const [daysBackward, setDaysBackward] = useState(7);
  const [showAddMeetingPopup, setShowAddMeetingPopup] = useState(false);
  const [showTrashCan, setShowTrashCan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  useEffect(() => {
    if (!session) {
      console.log("Session is not available.");
      return;
    }
    fetchMeetings();
  }, [daysForward, daysBackward, session]);

  useEffect(() => {
    // Beräkna initial höjd baserat på innehåll och fönsterhöjd
    const calculateInitialHeight = () => {
      const itemHeight = 80; // Uppskattad höjd per möte
      const headerHeight = 120; // Höjd för header-delen
      const maxHeight = window.innerHeight * 0.4; // Max 40% av fönsterhöjden
      
      const calculatedHeight = Math.min(
        headerHeight + (upcomingMeetings.length * itemHeight),
        maxHeight
      );
      
      // Sätt minimum höjd till 200px eller 25% av fönsterhöjden
      const minHeight = Math.max(200, window.innerHeight * 0.25);
      
      setTopSectionHeight(Math.max(calculatedHeight, minHeight));
    };

    calculateInitialHeight();
  }, [upcomingMeetings]);

  const fetchMeetings = async () => {
    if (!session?.accessToken) {
      console.log("Not signed in or no access token available");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch Google Calendar events
      const googleResponse = await fetch(
        `/api/calendar?daysForward=${daysForward}&daysBackward=${daysBackward}`
      );
      
      // Fetch Outlook Calendar events
      const outlookResponse = await fetch(
        `/api/outlook-calendar?daysForward=${daysForward}&daysBackward=${daysBackward}`
      );
      
      if (!googleResponse.ok || !outlookResponse.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const googleData = await googleResponse.json();
      const outlookData = await outlookResponse.json();
      
      // Kombinera och sortera mötena
      const allUpcoming = [...(googleData.upcoming || []), ...(outlookData.events || [])]
        .filter(meeting => new Date(meeting.start.dateTime) > new Date())
        .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
        
      const allPast = [...(googleData.past || []), ...(outlookData.events || [])]
        .filter(meeting => new Date(meeting.start.dateTime) <= new Date())
        .sort((a, b) => new Date(b.start.dateTime) - new Date(a.start.dateTime));

      setUpcomingMeetings(allUpcoming.filter(meeting => 
        !deletedMeetings.some(deleted => deleted.id === meeting.id)
      ));
      
      setPastMeetings(allPast.filter(meeting => 
        !deletedMeetings.some(deleted => deleted.id === meeting.id)
      ));
      
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUpcomingMeetings = upcomingMeetings.filter((meeting) =>
    meeting.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPastMeetings = pastMeetings.filter((meeting) =>
    meeting.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMeetingClick = () => {
    setShowAddMeetingPopup(true);
  };

  const handleCloseAddMeetingPopup = () => {
    setShowAddMeetingPopup(false);
    fetchMeetings();
  };

  const handleNewMeeting = (newMeeting) => {
    fetchMeetings();
  };

  const handleDaysForwardChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setDaysForward(value);
    }
  };

  const handleDaysBackwardChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setDaysBackward(value);
    }
  };

  const handleHorizontalResize = (e) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    const startY = e.clientY;
    const initialHeight = topSectionHeight;

    function onMouseMove(e) {
      const deltaY = e.clientY - startY;
      let newHeight = initialHeight + deltaY;

      if (newHeight < 50) newHeight = 50;
      if (newHeight > window.innerHeight - 100) newHeight = window.innerHeight - 100;

      setTopSectionHeight(newHeight);
    }

    function onMouseUp() {
      setIsDraggingDivider(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleOpenTrashCan = () => {
    setShowTrashCan(true);
  };

  const handleCloseTrashCan = () => {
    setShowTrashCan(false);
  };

  const handleRestoreMeeting = (meetingId) => {
    const meetingToRestore = deletedMeetings.find(meeting => meeting.id === meetingId);
    if (meetingToRestore) {
      setDeletedMeetings(prev => prev.filter(m => m.id !== meetingId));
      const now = new Date();
      const meetingDate = new Date(meetingToRestore.start.dateTime);
      if (meetingDate > now) {
        setUpcomingMeetings(prev => [...prev, meetingToRestore]);
      } else {
        setPastMeetings(prev => [...prev, meetingToRestore]);
      }
    }
  };

  const handlePermanentDeleteMeeting = (meetingId) => {
    const confirmPermanentDeletion = window.confirm("Vill du verkligen ta bort detta möte permanent?");
    if (!confirmPermanentDeletion) {
      return;
    }
    setDeletedMeetings(prev => prev.filter(m => m.id !== meetingId));
    deleteMeetingFromCalendar(meetingId);
  };

  const deleteMeetingFromCalendar = async (meetingId) => {
    try {
      const response = await fetch('/api/delete-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId }),
      });

      if (response.ok) {
        console.log("Meeting deleted permanently from calendar!");
        fetchMeetings();
      } else {
        const errorData = await response.json();
        console.error("Failed to delete meeting permanently:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting meeting permanently:", error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    const meetingToDelete = upcomingMeetings.find(meeting => meeting.id === meetingId) || 
                           pastMeetings.find(meeting => meeting.id === meetingId);

    if (meetingToDelete) {
      // Ta bort från aktuella listor först
      setUpcomingMeetings(prev => prev.filter(m => m.id !== meetingId));
      setPastMeetings(prev => prev.filter(m => m.id !== meetingId));
      
      // Lägg till i papperskorgen
      const deletedMeeting = {
        ...meetingToDelete,
        type: 'meeting',
        deletedAt: new Date().toISOString()
      };

      // Uppdatera både state och localStorage
      const updatedDeletedItems = [...deletedMeetings, deletedMeeting];
      setDeletedMeetings(updatedDeletedItems);
      localStorage.setItem('deleted-items', JSON.stringify(updatedDeletedItems));
    }
  };

  const formatDateTime = (startDateTime, endDateTime) => {
    if (typeof window === 'undefined') return ''; // Return empty on server
    if (!startDateTime || !endDateTime) return "Tid saknas";

    try {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      
      return new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Stockholm'
      }).format(start) + " - " + 
      new Intl.DateTimeFormat('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Stockholm'
      }).format(end);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Ogiltigt datumformat";
    }
  };

  const handleShowMeetingDetails = (meeting) => {
    setSelectedMeetingId(meeting.id);
    onShowMeetingDetails(meeting);
  };

  const MeetingItem = ({ meeting, isPast }) => {
    const [showActions, setShowActions] = useState(false);
    const isSelected = meeting.id === selectedMeetingId;

    return (
      <li
        className={`mb-2 p-2 rounded relative group ${
          darkMode 
            ? isSelected ? "bg-gray-600" : "bg-gray-700"
            : isSelected ? "bg-purple-100" : "bg-gray-200"
        } ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <button
                className={`p-1 rounded transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-600' 
                    : 'hover:bg-gray-300'
                }`}
                onClick={() => handleShowMeetingDetails(meeting)}
                title="Visa mötesdetaljer"
              >
                📄
              </button>
              <button
                className={`p-1 rounded transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-600' 
                    : 'hover:bg-gray-300'
                }`}
                onClick={() => handleDeleteMeeting(meeting.id)}
                title="Ta bort"
              >
                🗑️
              </button>
            </div>

            <div className="flex flex-col">
              <a 
                href={meeting.htmlLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-500"
              >
                {meeting.summary || "Namnlöst möte"}
              </a>
              {(meeting.hangoutLink || meeting.conferenceLink) && (
                <a 
                  href={meeting.hangoutLink || meeting.conferenceLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-500"
                >
                  {meeting.conferenceType || 'Google Meet'} →
                </a>
              )}
              <span className="text-sm text-gray-400" suppressHydrationWarning>
                {formatDateTime(meeting.start.dateTime, meeting.end.dateTime)}
              </span>
            </div>
          </div>
          <CalendarIcon type={meeting.source || 'google'} />
        </div>
      </li>
    );
  };

  return (
    <div
      className={`h-full p-4 overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Fixed header section */}
      <div className="flex-none p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className={`relative p-2 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
                : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
            }`}
            onClick={fetchMeetings}
            disabled={isLoading}
            title="Uppdatera"
          >
            {isLoading ? (
              <Spinner size="small" darkMode={darkMode} />
            ) : (
              '🔄'
            )}
          </button>
          <button
            className={`p-2 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
                : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
            }`}
            onClick={handleAddMeetingClick}
            title="Lägg till nytt möte"
          >
            📅
          </button>
          <button
            className={`relative p-2 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
                : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
            }`}
            onClick={handleOpenTrashCan}
            title="Papperskorg"
          >
            🗑️
            {deletedMeetings.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[0.6rem] font-bold leading-none text-white bg-red-500 rounded-full">
                {deletedMeetings.filter(item => item.type === 'meeting').length + 
                 deletedMeetings.filter(item => item.type === 'note' || item.type === 'meetingNote').length}
              </span>
            )}
          </button>
        </div>
        <input
          type="text"
          placeholder="Sök möten..."
          className={`w-full p-2 mb-4 ${
            darkMode ? "bg-gray-700 text-white" : "bg-orange-50 text-black"
          }`}
          onChange={(e) => setSearchTerm(e.target.value)}
          suppressHydrationWarning
        />
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Upcoming meetings */}
        <div 
          className="flex-none overflow-y-auto px-4"
          style={{ 
            height: topSectionHeight || '50vh'
          }}
        >
          <h2 className="text-xl font-bold sticky top-0 bg-inherit py-2">Kommande Möten</h2>
          <div className="flex items-center mb-2">
            <span className={darkMode ? "text-white" : "text-black"}>
              Visa dagar framåt:
            </span>
            <input
              type="number"
              className={`w-20 p-2 ml-2 ${
                darkMode ? "bg-gray-700 text-white" : "bg-orange-50 text-black"
              }`}
              value={daysForward}
              onChange={handleDaysForwardChange}
              min="1"
              suppressHydrationWarning
              data-form-type="other"
            />
          </div>
          <ul className="space-y-2">
            {filteredUpcomingMeetings.map((meeting) => (
              <MeetingItem key={meeting.id} meeting={meeting} isPast={false} />
            ))}
          </ul>
        </div>

        {/* Divider - Only visible when topSectionHeight is set */}
        {topSectionHeight && (
          <div
            className={`h-1 mx-4 cursor-row-resize hover:bg-purple-500 transition-colors duration-200 ${
              isDraggingDivider ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            onMouseDown={handleHorizontalResize}
          />
        )}

        {/* Past meetings */}
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <h2 className="text-xl font-bold sticky top-0 bg-inherit py-2">Tidigare Möten</h2>
          <div className="flex items-center mb-2">
            <span className={darkMode ? "text-white" : "text-black"}>
              Visa dagar bakåt:
            </span>
            <input
              type="number"
              className={`w-20 p-2 ml-2 ${
                darkMode ? "bg-gray-700 text-white" : "bg-orange-50 text-black"
              }`}
              value={daysBackward}
              onChange={handleDaysBackwardChange}
              min="1"
              suppressHydrationWarning
              data-form-type="other"
            />
          </div>
          <ul className="space-y-2">
            {filteredPastMeetings.map((meeting) => (
              <MeetingItem key={meeting.id} meeting={meeting} isPast={true} />
            ))}
          </ul>
        </div>
      </div>

      {/* Popups */}
      {showAddMeetingPopup && (
        <AddMeetingPopup
          onClose={handleCloseAddMeetingPopup}
          darkMode={darkMode}
          session={session}
          onMeetingCreated={handleNewMeeting}
        />
      )}
      {showTrashCan && (
        <TrashCanPopup
          onClose={handleCloseTrashCan}
          darkMode={darkMode}
          deletedMeetings={deletedMeetings}
          onRestoreMeeting={handleRestoreMeeting}
          onPermanentDeleteMeeting={handlePermanentDeleteMeeting}
          setDeletedMeetings={setDeletedMeetings}
        />
      )}
    </div>
  );
}
