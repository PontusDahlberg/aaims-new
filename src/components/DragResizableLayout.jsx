"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import GoogleChat from "./GoogleChat";
import Header from "./Header";
import Footer from "./Footer";
import MainContent from "./MainContent";

export default function DragResizableLayout({ darkMode, toggleDarkMode, session, children }) {
  const [windowWidth, setWindowWidth] = useState(1200);
  const [leftWidth, setLeftWidth] = useState(300);
  const [middleWidth, setMiddleWidth] = useState(600);
  const [topSectionHeight, setTopSectionHeight] = useState(300);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleShowMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
  };

  useEffect(() => {
    const updateWidths = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setLeftWidth(width * 0.25);
      setMiddleWidth(width * 0.5);
    };

    updateWidths();

    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rightWidth = Math.max(100, windowWidth - leftWidth - middleWidth);

  const handleLeftMiddleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const initLeft = leftWidth;
    const initMiddle = middleWidth;

    function onMouseMove(e) {
      const delta = e.clientX - startX;
      let newLeft = initLeft + delta;
      let newMiddle = initMiddle - delta;

      if (newLeft < 80) newLeft = 80;
      if (newMiddle < 200) newMiddle = 200;

      setLeftWidth(newLeft);
      setMiddleWidth(newMiddle);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleMiddleRightResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const initMiddle = middleWidth;

    function onMouseMove(e) {
      const delta = e.clientX - startX;
      let newMiddle = initMiddle + delta;

      if (newMiddle < 200) newMiddle = 200;
      const maxMiddle = windowWidth - leftWidth - 100;
      if (newMiddle > maxMiddle) newMiddle = maxMiddle;

      setMiddleWidth(newMiddle);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleHorizontalResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const initHeight = topSectionHeight;

    function onMouseMove(e) {
      const deltaY = e.clientY - startY;
      let newHeight = initHeight + deltaY;

      if (newHeight < 50) newHeight = 50;
      if (newHeight > window.innerHeight - 100)
        newHeight = window.innerHeight - 100;

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
      className={`w-screen h-screen flex flex-col overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} session={session} />
      <div className="flex flex-grow overflow-hidden relative">
        <div style={{ width: leftWidth }}>
          <Sidebar
            darkMode={darkMode}
            session={session}
            onShowMeetingDetails={handleShowMeetingDetails}
          />
        </div>
        <div
          className="h-full w-1 bg-gray-500 cursor-col-resize"
          onMouseDown={handleLeftMiddleResize}
        />

        <div
          style={{ width: middleWidth }}
          className="flex flex-col border-r border-gray-400"
        >
          <div style={{ height: topSectionHeight }}>
            <MainContent darkMode={darkMode} meeting={selectedMeeting} />
          </div>

          <div
            className="h-2 bg-gray-500 cursor-row-resize mx-4"
            onMouseDown={handleHorizontalResize}
          />

          <div className="flex-1 p-4 overflow-y-auto">
            <textarea
              className={`w-full h-full p-2 border rounded ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-black"
              }`}
              placeholder="Skriv anteckningar här..."
            />
          </div>
        </div>

        <div
          className="h-full w-2 bg-gray-500 cursor-col-resize"
          onMouseDown={handleMiddleRightResize}
        />

        <div style={{ width: rightWidth }}>
          <GoogleChat darkMode={darkMode} />
        </div>
      </div>
      {children}
      <Footer darkMode={darkMode} />
    </div>
  );
}