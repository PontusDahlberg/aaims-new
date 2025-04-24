// src/components/MeetingStatus.jsx
"use client";

import { useState, useEffect } from 'react';

export default function MeetingStatus({ darkMode, recordingId }) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleExtensionMessage = (message) => {
      if (message.type === 'RECORDING_STATUS') {
        setStatus(message.status);
        setProgress(message.progress || 0);
        setError(message.error || null);
      }
    };

    // Lyssna på meddelanden från Chrome extension
    if (chrome?.runtime) {
      chrome.runtime.onMessage.addListener(handleExtensionMessage);
      return () => chrome.runtime.onMessage.removeListener(handleExtensionMessage);
    }
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return {
          icon: '⚪',
          text: 'Redo att spela in',
          color: darkMode ? 'text-gray-400' : 'text-gray-600'
        };
      case 'recording':
        return {
          icon: '🔴',
          text: 'Inspelning pågår',
          color: 'text-red-500'
        };
      case 'paused':
        return {
          icon: '⏸️',
          text: 'Inspelning pausad',
          color: 'text-yellow-500'
        };
      case 'processing':
        return {
          icon: '⚙️',
          text: `Transkriberar (${progress}%)`,
          color: 'text-blue-500'
        };
      case 'completed':
        return {
          icon: '✅',
          text: 'Transkribering klar',
          color: 'text-green-500'
        };
      case 'error':
        return {
          icon: '❌',
          text: error || 'Ett fel uppstod',
          color: 'text-red-500'
        };
      default:
        return {
          icon: '❓',
          text: 'Okänd status',
          color: 'text-gray-500'
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div className={`flex items-center space-x-2 p-2 rounded ${color}`}>
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
      {status === 'processing' && (
        <div className="w-24 h-1 bg-gray-200 rounded">
          <div 
            className="h-full bg-blue-500 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
