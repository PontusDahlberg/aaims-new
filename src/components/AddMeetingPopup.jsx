"use client";

import { useState, useRef, useEffect } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import SchedulingAssistant from './SchedulingAssistant';
import CalendarMatrix from './CalendarMatrix';

export default function AddMeetingPopup({ onClose, darkMode, session, onMeetingCreated }) {
  const [meetingType, setMeetingType] = useState("digital");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mapUrl, setMapUrl] = useState("");
  const [conferenceType, setConferenceType] = useState("meet");
  const [conferenceLink, setConferenceLink] = useState("");
  const [showSchedulingAssistant, setShowSchedulingAssistant] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendarMatrix, setShowCalendarMatrix] = useState(false);
  const [attendeeEmails, setAttendeeEmails] = useState([]);
  const cardRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const validateTimeRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (startTime) {
      const startDateTime = new Date(startTime);
      const minEndTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 minuter minimum
      
      if (endTime) {
        const endDateTime = new Date(endTime);
        if (endDateTime <= startDateTime) {
          setEndTime(minEndTime.toISOString().slice(0, 16));
        }
      }
    }
  }, [startTime]);

  const handleMeetingTypeChange = (type) => {
    setMeetingType(type);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleContactSelect = (contact) => {
    setContacts([...contacts, contact]);
  };

  const handleTimeSelected = (time) => {
    setSelectedTime(time);
    setStartTime(time.start.toISOString().slice(0, 16));
    setEndTime(time.end.toISOString().slice(0, 16));
    setShowCalendarMatrix(false);
  };

  const handleSubmit = async () => {
    // Lägg till validering för mötesnamn
    if (!summary.trim()) {
      alert("Du måste ange ett namn för mötet.");
      return;
    }

    if (!startTime || !endTime) {
      alert("Välj både start- och sluttid.");
      return;
    }

    if (!validateTimeRange(startTime, endTime)) {
      alert("Sluttiden måste vara efter starttiden.");
      return;
    }

    const toIsoString = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString();
    };

    const meetingDetails = {
      summary,
      description,
      start: { 
        dateTime: toIsoString(startTime), 
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      },
      end: { 
        dateTime: toIsoString(endTime), 
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      },
      attendees: contacts.map(email => ({ email })),
      conferenceType: meetingType === 'digital' ? conferenceType : null,
      conferenceLink: meetingType === 'digital' ? conferenceLink : null
    };

    if (meetingType === 'physical' || meetingType === 'hybrid') {
      meetingDetails.location = address;
    }

    if (meetingType === 'digital' || meetingType === 'hybrid') {
      if (conferenceType === 'meet') {
        meetingDetails.conferenceData = {
          createRequest: { requestId: `aaims-${Date.now()}` }
        };
      } else {
        meetingDetails.location = conferenceLink; // För Teams/Zoom/etc
      }
    }

    try {
      const response = await fetch('/api/add-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }

      const data = await response.json();
      console.log("Meeting created successfully:", data);
      onClose();
      onMeetingCreated(data);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      alert(`Failed to create meeting: ${error.message}`);
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    if (startTime && !validateTimeRange(startTime, newEndTime)) {
      const startDateTime = new Date(startTime);
      const minEndTime = new Date(startDateTime.getTime() + 30 * 60000);
      setEndTime(minEndTime.toISOString().slice(0, 16));
    } else {
      setEndTime(newEndTime);
    }
  };

  const handleMouseDown = (e) => {
    if (cardRef.current) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      document.body.classList.add("grabbing");
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !cardRef.current) return;
    
    if (!e.touches) {
      e.preventDefault();
    }
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setPosition((prevPosition) => ({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove("grabbing");
  };

  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("touchmove", handleMouseMove, { passive: true });
      card.addEventListener("mouseup", handleMouseUp);
      card.addEventListener("touchend", handleMouseUp);
      card.addEventListener("mouseleave", handleMouseUp);

      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("touchmove", handleMouseMove);
        card.removeEventListener("mouseup", handleMouseUp);
        card.removeEventListener("touchend", handleMouseUp);
        card.removeEventListener("mouseleave", handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (address && (meetingType === "physical" || meetingType === "hybrid")) {
      const encodedAddress = encodeURIComponent(address);
      setMapUrl(`https://maps.google.com/maps?q=${encodedAddress}&output=embed`);
    } else {
      setMapUrl("");
    }
  }, [address, meetingType]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card
        ref={cardRef}
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          cursor: isDragging ? "grabbing" : "grab",
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh', // Begränsa höjden till 90% av viewport
        }}
        className={`${darkMode ? "bg-gray-800" : "bg-white"} flex flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-white">Lägg till nytt möte</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Grundläggande mötesinfo */}
          <div className="space-y-4 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-white">Titel:</label>
              <input
                type="text"
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'}`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Mötets titel"
                suppressHydrationWarning
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-white">Beskrivning:</label>
              <textarea
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mötets beskrivning"
                rows="3"
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Mötestid */}
          <div className="space-y-4 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-white">Mötestid:</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCalendarMatrix(true)}
                  className={`flex-1 p-2 rounded ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Välj tid manuellt
                </button>
                <button
                  onClick={() => setShowSchedulingAssistant(true)}
                  className={`flex-1 p-2 rounded ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Hitta tid som passar alla
                </button>
              </div>

              {selectedTime && (
                <div className={`mt-2 p-2 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  Vald tid: {new Date(selectedTime.start).toLocaleString('sv-SE')} - 
                            {new Date(selectedTime.end).toLocaleString('sv-SE')}
                </div>
              )}
            </div>
            
            {showCalendarMatrix && (
              <CalendarMatrix
                darkMode={darkMode}
                onTimeSelect={handleTimeSelected}
                onClose={() => setShowCalendarMatrix(false)}
                workHours={{ start: 8, end: 21 }}
              />
            )}

            {showSchedulingAssistant && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                <Card className={`w-[600px] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Hitta lämplig mötestid</h2>
                    <button 
                      onClick={() => setShowSchedulingAssistant(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <SchedulingAssistant
                    attendees={attendeeEmails}
                    onTimeSelect={(time) => {
                      handleTimeSelected(time);
                      setShowSchedulingAssistant(false);
                    }}
                    darkMode={darkMode}
                  />
                </Card>
              </div>
            )}
          </div>

          {/* Mötestyp och övriga inställningar */}
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-white">Mötestyp:</label>
              <div className="flex">
                <button
                  className={`mr-2 px-4 py-2 rounded ${
                    meetingType === "digital" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleMeetingTypeChange("digital")}
                >
                  Digitalt
                </button>
                <button
                  className={`mr-2 px-4 py-2 rounded ${
                    meetingType === "physical" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleMeetingTypeChange("physical")}
                >
                  Fysiskt
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    meetingType === "hybrid" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleMeetingTypeChange("hybrid")}
                >
                  Hybrid
                </button>
              </div>
            </div>

            {(meetingType === "physical" || meetingType === "hybrid") && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white">Adress:</label>
                <input
                  type="text"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'}`}
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Ange mötesadress"
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                  data-dashlane-ignore="true"
                />
                {address && (
                  <div className="mt-2 text-white">
                    {mapUrl ? (
                      <iframe
                        width="100%"
                        height="200"
                        src={mapUrl}
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        aria-hidden="false"
                        tabIndex="0"
                      ></iframe>
                    ) : (
                      <div>Laddar karta...</div>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Öppna i Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}

            {(meetingType === "digital" || meetingType === "hybrid") && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white">Mötesplattform:</label>
                <div className="flex mb-2">
                  <button
                    className={`mr-2 px-4 py-2 rounded ${
                      conferenceType === "meet" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => setConferenceType("meet")}
                  >
                    Google Meet
                  </button>
                  <button
                    className={`mr-2 px-4 py-2 rounded ${
                      conferenceType === "teams" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => setConferenceType("teams")}
                  >
                    Teams
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      conferenceType === "other" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => setConferenceType("other")}
                  >
                    Annan
                  </button>
                </div>
                
                {conferenceType !== 'meet' && (
                  <div className="mt-2">
                    <label className="block text-sm font-bold mb-2 text-white">Möteslänk:</label>
                    <input
                      type="url"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                      }`}
                      value={conferenceLink}
                      onChange={(e) => setConferenceLink(e.target.value)}
                      placeholder="Klistra in möteslänk här"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Knappar alltid synliga längst ner */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button onClick={handleSubmit}>Skapa möte</Button>
          <Button 
            className="!bg-gray-500 hover:!bg-gray-600 text-white" 
            onClick={onClose}
          >
            Avbryt
          </Button>
        </div>
      </Card>
    </div>
  );
}
