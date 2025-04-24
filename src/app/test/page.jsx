"use client";

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Kontrollerar...');
  const EXTENSION_ID = 'liicapnliikphinjmbfbdpgjbkbpkeci';

  useEffect(() => {
    async function checkExtension() {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        setStatus('Chrome API är inte tillgänglig');
        return;
      }

      try {
        chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: 'CHECK_INSTALLATION' 
        }, (response) => {
          if (chrome.runtime.lastError) {
            setStatus('Tillägg inte tillgängligt: ' + chrome.runtime.lastError.message);
            return;
          }
          setStatus(response?.success ? 'Tillägg anslutet!' : 'Tillägg inte hittat');
        });
      } catch (error) {
        setStatus('Fel vid kontroll av tillägg: ' + error.message);
      }
    }

    checkExtension();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">AAIMS Tilläggskontroll</h1>
      <div className="p-4 rounded border">
        <p>Status: <span className="font-bold">{status}</span></p>
      </div>
    </div>
  );
}
