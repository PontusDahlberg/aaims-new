"use client";

import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';

export default function MeetingNotes({ darkMode, meeting, deletedMeetings, setDeletedMeetings }) {
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [dirtyNotes, setDirtyNotes] = useState(new Set());
  const [contentHeight, setContentHeight] = useState(300);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const previousMeetingId = useRef(meeting?.id);

  useEffect(() => {
    if (meeting?.id) {
      const storageKey = `meeting-notes-${meeting.id}`;
      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          setMeetingNotes(parsedNotes);
        } catch (error) {
          console.error('Error parsing meeting notes:', error);
          setMeetingNotes([]);
        }
      } else {
        setMeetingNotes([]);
      }
    }
  }, [meeting?.id]);

  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      text: '',
      timestamp: new Date().toISOString()
    };
    setMeetingNotes(prev => [newNote, ...prev]);
  };

  const handleNoteChange = (noteId, newText) => {
    const updatedNotes = meetingNotes.map(note => 
      note.id === noteId ? { ...note, text: newText } : note
    );
    setMeetingNotes(updatedNotes);
    saveMeetingNotes(updatedNotes);
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = meetingNotes.find(note => note.id === noteId);
    if (noteToDelete) {
      const deletedNote = {
        ...noteToDelete,
        type: 'meetingNote',
        meetingId: meeting.id,
        meetingTitle: meeting.summary,
        deletedAt: new Date().toISOString()
      };
      setDeletedMeetings(prev => [...prev, deletedNote]);
      
      setMeetingNotes(prev => prev.filter(note => note.id !== noteId));
      saveMeetingNotes(meetingNotes.filter(note => note.id !== noteId));
    }
  };

  const saveMeetingNotes = (notes) => {
    if (meeting?.id) {
      const storageKey = `meeting-notes-${meeting.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  };

  const handleSaveNote = (noteId) => {
    if (meeting?.id) {
      saveMeetingNotes();
      setDirtyNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleContentResize = (e) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    const startY = e.clientY;
    const initialHeight = contentHeight;

    function onMouseMove(e) {
      const deltaY = e.clientY - startY;
      let newHeight = initialHeight + deltaY;
      
      if (newHeight < 100) newHeight = 100;
      if (newHeight > window.innerHeight - 400) newHeight = window.innerHeight - 400;
      
      setContentHeight(newHeight);
    }

    function onMouseUp() {
      setIsDraggingDivider(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="space-y-4">
      {meeting && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Anteckningar för mötet: {meeting.summary}
              </h3>
              <button
                onClick={handleAddNote}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                title="Lägg till ny anteckning"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-500" suppressHydrationWarning>
              {new Date(meeting.start.dateTime).toLocaleString('sv-SE')}
            </p>
          </div>

          <div className="space-y-4" style={{ height: `${contentHeight}px`, overflow: 'auto' }}>
            {meetingNotes.map((note) => (
              <div key={note.id} className={`p-4 rounded-lg border ${
                darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500" suppressHydrationWarning>
                    {new Date(note.timestamp).toLocaleString('sv-SE')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {dirtyNotes.has(note.id) && (
                      <button
                        onClick={() => handleSaveNote(note.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-400 hover:bg-indigo-500 text-white transition-colors"
                        title="Spara anteckning"
                      >
                        💾
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                      title="Ta bort anteckning"
                    >
                      -
                    </button>
                  </div>
                </div>
                <textarea
                  value={note.text}
                  onChange={(e) => handleNoteChange(note.id, e.target.value)}
                  className={`w-full p-2 rounded bg-transparent outline-none ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                  rows="4"
                  placeholder="Skriv din anteckning här..."
                />
              </div>
            ))}
          </div>

          <div
            className={`h-1 cursor-row-resize hover:bg-purple-500 transition-colors duration-200 ${
              isDraggingDivider ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            onMouseDown={handleContentResize}
          />
        </>
      )}
    </div>
  );
}
