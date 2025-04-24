"use client";

import { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import MeetingNotes from './MeetingNotes';

export default function MainContent({ darkMode, meeting, deletedMeetings, updateDeletedItems }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState('');
  const [uploadedDocumentNames, setUploadedDocumentNames] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [protocol, setProtocol] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('gpt-4');
  const [agenda, setAgenda] = useState('');
  const [showTranscript, setShowTranscript] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [showProtocol, setShowProtocol] = useState(true);
  const [showTranscription, setShowTranscription] = useState(false);
  const [contentHeight, setContentHeight] = useState(400);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [generalNotes, setGeneralNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('general-notes');
      return saved ? JSON.parse(saved) : [{ id: 1, text: '', timestamp: new Date().toISOString() }];
    }
    return [{ id: 1, text: '', timestamp: new Date().toISOString() }];
  });

  useEffect(() => {
    const handleExtensionMessage = (message) => {
      if (message.type === 'TRANSCRIPTION_COMPLETE') {
        setTranscription(message.transcript);
        setShowTranscription(true);
      } else if (message.type === 'TRANSCRIPTION_ERROR') {
        console.error('Transcription error:', message.error);
      }
    };

    const connectToExtension = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(handleExtensionMessage);
        return () => {
          chrome.runtime.onMessage.removeListener(handleExtensionMessage);
        };
      }
      return () => {};
    };

    const cleanup = connectToExtension();
    return cleanup;
  }, []);

  useEffect(() => {
    const savedDeletedItems = localStorage.getItem('deleted-items');
    if (savedDeletedItems) {
      updateDeletedItems(JSON.parse(savedDeletedItems));
    }
  }, []);

  useEffect(() => {
    // Ladda borttagna objekt från localStorage
    const loadDeletedItems = () => {
      const savedItems = localStorage.getItem('deleted-items');
      if (savedItems) {
        updateDeletedItems(JSON.parse(savedItems));
      }
    };

    loadDeletedItems();
  }, []);

  const handleStartRecording = async () => {
    console.log('Attempting to start recording...');
    setIsStarting(true);
    try {
      const response = await fetch('/api/start-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingUrl: meeting.url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recording');
      }

      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(error.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRecording = () => {
    console.log('Attempting to stop recording...');
    setIsRecording(false);
    console.log('Recording stopped successfully');
  };

  const handleStartBot = async () => {
    try {
      const response = await fetch('/api/start-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingUrl: meeting.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to start bot');
      }

      setIsBotActive(true);
    } catch (error) {
      console.error('Error starting bot:', error);
      alert(error.message);
    }
  };

  const handleStopBot = async () => {
    try {
      setIsBotActive(false);
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Attempting to upload file:', file.name);
    setUploadedAudioFileName(file.name);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Transcription failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Transcription response:', data);
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const handleDocumentUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    console.log('Attempting to upload documents:', files.length);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Document upload failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Document upload response:', data);
      setUploadedDocumentNames(Array.from(files).map(file => file.name));
    } catch (error) {
      console.error('Document upload error:', error);
    }
  };

  const handlePlaySelection = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const selectedText = selection.toString();
      const start = transcription.indexOf(selectedText);
    }
  };

  const generateSummaryAndProtocol = async (transcript) => {
    try {
      const response = await fetch('/api/analyze-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcript,
          agenda: agenda,
          model: selectedLLM
        })
      });
      const data = await response.json();
      setSummary(data.summary);
      setProtocol(data.protocol);
    } catch (error) {
      console.error('Error analyzing meeting:', error);
    }
  };

  const generateAISummary = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcription,
          type: 'summary'
        })
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
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
      if (newHeight > window.innerHeight - 200) newHeight = window.innerHeight - 200;

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

  const handleNoteChange = (id, newText) => {
    const updatedNotes = generalNotes.map(note => 
      note.id === id ? { ...note, text: newText } : note
    );
    setGeneralNotes(updatedNotes);
    // Spara direkt till localStorage
    localStorage.setItem('general-notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    setGeneralNotes(prev => [{
      id: Math.max(...prev.map(n => n.id)) + 1,
      text: '',
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = generalNotes.find(note => note.id === noteId);
    if (noteToDelete) {
      const deletedNote = {
        ...noteToDelete,
        type: 'note',
        summary: noteToDelete.text.substring(0, 50),
        kind: 'note',
        status: 'deleted',
        deletedAt: new Date().toISOString()
      };

      // Använd den nya updateDeletedItems funktionen
      const updatedDeletedItems = [...deletedMeetings, deletedNote];
      updateDeletedItems(updatedDeletedItems);

      // Ta bort anteckningen från generalNotes
      const updatedNotes = generalNotes.filter(note => note.id !== noteId);
      setGeneralNotes(updatedNotes);
      localStorage.setItem('general-notes', JSON.stringify(updatedNotes));
    }
  };

  return (
    <div className={`h-full overflow-auto ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <div className="p-4" style={{ height: `${contentHeight}px`, overflow: 'auto' }}>
        <div className="flex flex-col">
          <div className="flex space-x-4">
            {meeting ? (
              <>
                <div className="flex space-x-4">
                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-700 text-white rounded-full shadow-md transition-colors"
                      title="Stoppa inspelning"
                    >
                      ⬛
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors"
                      disabled={isStarting}
                      title="Starta inspelning"
                    >
                      {isStarting ? '...' : '⏺️'}
                    </button>
                  )}
                  
                  {isBotActive ? (
                    <button
                      onClick={handleStopBot}
                      className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-700 text-white rounded-full shadow-md transition-colors"
                      title="Stoppa AAIMS BOT"
                    >
                      🤖
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBot}
                      className="w-10 h-10 flex items-center justify-center bg-purple-500 hover:bg-purple-700 text-white rounded-full shadow-md transition-colors"
                      title="Starta AAIMS BOT"
                    >
                      🤖
                    </button>
                  )}
                </div>

                <div className="mt-6 p-4 border rounded-lg border-gray-600">
                  <h3 className="font-bold mb-2 text-lg">Transkribering av fysiskt möte</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Ladda upp en ljudinspelning från ett fysiskt möte för transkribering
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100"
                  />
                  {uploadedAudioFileName && (
                    <p className="text-sm text-gray-400 mt-2">
                      Uppladdad ljudfil: {uploadedAudioFileName}
                    </p>
                  )}
                </div>

                <div className="mt-6 p-4 border rounded-lg border-gray-600">
                  <h3 className="font-bold mb-2 text-lg">Möteshandlingar</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Ladda upp dokument kopplade till mötet "{meeting.summary}"
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
                    multiple
                    ref={documentInputRef}
                    onChange={handleDocumentUpload}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100"
                  />
                  {uploadedDocumentNames.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Uppladdade dokument:</p>
                      <ul className="list-disc list-inside">
                        {uploadedDocumentNames.map((name, index) => (
                          <li key={index} className="text-sm text-gray-400">{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Välj ett möte från sidomenyn för att se kontroller och detaljer
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`h-1 cursor-row-resize hover:bg-purple-500 transition-colors duration-200 mx-4 ${
          isDraggingDivider ? 'bg-purple-500' : 'bg-gray-300'
        }`}
        onMouseDown={handleContentResize}
      />

      <div className="flex-1 overflow-auto p-4">
        <MeetingNotes 
          darkMode={darkMode} 
          meeting={meeting}
          className="mb-6"
          deletedMeetings={deletedMeetings}
          setDeletedMeetings={updateDeletedItems}
        />
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Generella anteckningar</h3>
            <button
              onClick={handleAddNote}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              title="Lägg till ny anteckning"
            >
              +
            </button>
          </div>
          
          <div className="space-y-4">
            {generalNotes.map((note, index) => (
              <div key={note.id}>
                {index > 0 && (
                  <div className="my-4 border-t border-gray-300 dark:border-gray-600" />
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500" suppressHydrationWarning>
                    {typeof window === 'undefined' 
                      ? '' 
                      : new Date(note.timestamp).toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          timeZone: 'Europe/Stockholm'
                        })}
                  </span>
                  <div className="flex items-center space-x-2">
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
                  className={`w-full p-4 rounded-lg border ${
                    darkMode 
                      ? "bg-gray-700 text-white border-gray-600" 
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  rows="4"
                  placeholder="Skriv din anteckning här..."
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
