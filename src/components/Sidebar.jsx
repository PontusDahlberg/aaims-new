"use client";

import { useState, useEffect } from "react";
import AddMeetingPopup from "./AddMeetingPopup";
import { useSession } from "next-auth/react";

export default function Sidebar({ darkMode, onShowMeetingDetails }) {
  const [topSectionHeight, setTopSectionHeight] = useState(200);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysForward, setDaysForward] = useState(60);
  const [daysBackward, setDaysBackward] = useState(7);
  const [showAddMeetingPopup, setShowAddMeetingPopup] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      console.log("Session is not available.");
      return;
    }
    fetchMeetings();
  }, [daysForward, daysBackward, session]);

  const fetchMeetings = async () => {
    if (!session) {
      console.log("Not signed in.");
      return;
    }

    try {
      const cacheBuster = new Date().getTime();
      const upcomingResponse = await fetch(`/api/calendar?daysForward=${daysForward}&cb=${cacheBuster}`);
      const upcomingData = await upcomingResponse.json();
      console.log("Upcoming Meetings Data:", upcomingData);
      setUpcomingMeetings(upcomingData?.events || []);

      const pastResponse = await fetch(`/api/calendar?daysBackward=${daysBackward}&cb=${cacheBuster}`);
      const pastData = await pastResponse.json();
      console.log("Past Meetings Data:", pastData);
      setPastMeetings(pastData?.events || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
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
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className={`h-full p-4 overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
          onClick={fetchMeetings}
        >
          Uppdatera
        </button>
        <button
          className={`py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 outline-none focus:outline-none ring-2 ring-offset-1 ${
            darkMode
              ? "bg-gray-600 hover:bg-gray-500 ring-gray-400 text-white"
              : "bg-purple-600 hover:bg-purple-500 ring-purple-400 text-white"
          } font-bold`}
          onClick={handleAddMeetingClick}
        >
          Lägg till nytt möte
        </button>
      </div>
      <input
        type="text"
        placeholder="Sök möten..."
        className={`w-full p-2 mb-4 ${
          darkMode ? "bg-gray-700 text-white" : "bg-orange-50 text-black"
        }`}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ height: topSectionHeight, overflow: "hidden" }}>
        <h2 className="text-xl font-bold mb-2">Kommande Möten</h2>
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
          />
        </div>
        <ul>
          {filteredUpcomingMeetings.map((meeting) => (
            <li
              key={meeting.id}
              className={`mb-2 p-2 rounded flex justify-between items-center ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <a href={meeting.htmlLink} target="_blank" rel="noopener noreferrer">
                {meeting.summary || "Namnlöst möte"}
              </a>
              {meeting.hangoutLink && (
                <button
                  className={`ml-2 py-1 px-2 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                  onClick={() => window.open(meeting.hangoutLink, "_blank")}
                >
                  Meet
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="h-2 bg-gray-500 cursor-row-resize"
        onMouseDown={handleHorizontalResize}
      />
      <div>
        <h2 className="text-xl font-bold mt-4">Tidigare Möten</h2>
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
          />
        </div>
        <ul>
          {filteredPastMeetings.map((meeting) => (
            <li
              key={meeting.id}
              className={`mb-2 p-2 rounded flex justify-between items-center ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <a href={meeting.htmlLink} target="_blank" rel="noopener noreferrer">
                {meeting.summary || "Namnlöst möte"}
              </a>
              <button
                className={`ml-2 py-1 px-2 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                }`}
                onClick={() => onShowMeetingDetails(meeting)}
              >
                📄
              </button>
            </li>
          ))}
        </ul>
      </div>
      {showAddMeetingPopup && (
        <AddMeetingPopup onClose={handleCloseAddMeetingPopup} darkMode={darkMode} />
      )}
    </div>
  );
}