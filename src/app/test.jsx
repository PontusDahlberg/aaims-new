"use client";

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Checking...');
  const EXTENSION_ID = 'liicapnliikphinjmbfbdpgjbkbpkeci';

  useEffect(() => {
    // Test extension connection
    if (chrome?.runtime) {
      chrome.runtime.sendMessage(EXTENSION_ID, { 
        type: 'CHECK_INSTALLATION' 
      }, response => {
        if (chrome.runtime.lastError) {
          setStatus('Extension error: ' + chrome.runtime.lastError.message);
          return;
        }
        setStatus(response?.installed ? 'Extension connected!' : 'Extension not found');
      });
    } else {
      setStatus('Chrome API not available');
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">AAIMS Extension Test</h1>
      <div className="p-2 border rounded">
        Status: {status}
      </div>
    </div>
  );
}
