"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import GoogleChat from "./GoogleChat";
import Header from "./Header";
import Footer from "./Footer";
import MainContent from "./MainContent";
import { useSession } from "next-auth/react";

export default function DragResizableLayout({ children }) {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [leftWidth, setLeftWidth] = useState(400); // Ändra standardbredd från 300 till 400
  const [rightWidth, setRightWidth] = useState(300);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [deletedMeetings, setDeletedMeetings] = useState([]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleShowMeetingDetails = (meeting) => setSelectedMeeting(meeting);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lägg till useEffect för att beräkna optimal bredd vid start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Optimal bredd för sidebar (max 50% av fönsterbredden)
      const optimalWidth = Math.min(
        400, // Minimum bredd för att visa mötestitel
        window.innerWidth * 0.5 // Max 50% av fönsterbredden
      );
      setLeftWidth(optimalWidth);
    }
  }, []);

  // Uppdatera hanteringen av deletedMeetings
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedItems = localStorage.getItem('deleted-items');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          setDeletedMeetings(parsedItems);
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    // Lyssna på både storage och custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('deletedItemsUpdated', handleStorageChange);
    
    // Initial load
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deletedItemsUpdated', handleStorageChange);
    };
  }, []);

  // Uppdatera deletedMeetings när localStorage ändras
  const updateDeletedItems = (newItems) => {
    localStorage.setItem('deleted-items', JSON.stringify(newItems));
    setDeletedMeetings(newItems);
    window.dispatchEvent(new Event('deletedItemsUpdated'));
  };

  // Beräkna mittenkolumnens bredd
  const middleWidth = windowWidth - leftWidth - rightWidth;

  const handleLeftResize = (e) => {
    // Prevent default endast för mus-events
    if (!e.touches) {
      e.preventDefault();
    }
    setIsDragging(true);
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = Math.max(200, Math.min(startWidth + clientX - startX, windowWidth - 600));
      setLeftWidth(newWidth);
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.classList.remove('select-none');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMouseMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
    document.body.classList.add('select-none');
  };

  const handleRightResize = (e) => {
    // Prevent default endast för mus-events
    if (!e.touches) {
      e.preventDefault();
    }
    setIsDragging(true);
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startWidth = rightWidth;

    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = Math.max(200, Math.min(startWidth - (clientX - startX), windowWidth - 600));
      setRightWidth(newWidth);
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.classList.remove('select-none');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMouseMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
    document.body.classList.add('select-none');
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} session={session} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Vänster kolumn */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: `${leftWidth}px` }}
        >
          <Sidebar
            darkMode={darkMode}
            session={session}
            onShowMeetingDetails={handleShowMeetingDetails}
            deletedMeetings={deletedMeetings}
            setDeletedMeetings={setDeletedMeetings}
          />
          <div
            className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-purple-500 ${
              isDragging ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            onMouseDown={handleLeftResize}
            onTouchStart={handleLeftResize}
          />
        </div>

        {/* Mittenkolumn */}
        <div
          className="flex-1 overflow-hidden"
          style={{ minWidth: '400px' }}
        >
          <MainContent 
            darkMode={darkMode} 
            meeting={selectedMeeting} 
            deletedMeetings={deletedMeetings} 
            updateDeletedItems={updateDeletedItems}  // Skicka med den nya funktionen
          />
        </div>

        {/* Höger kolumn */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: `${rightWidth}px` }}
        >
          <div
            className={`absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-purple-500 ${
              isDragging ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            onMouseDown={handleRightResize}
            onTouchStart={handleRightResize}
          />
          <GoogleChat darkMode={darkMode} />
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
