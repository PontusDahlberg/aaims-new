"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MeetingResponse() {
  const searchParams = useSearchParams();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const slots = JSON.parse(searchParams.get('slots') || '[]');
  const duration = searchParams.get('duration');

  const handleSubmitResponse = async () => {
    try {
      const response = await fetch('/api/submit-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedSlots })
      });

      if (response.ok) {
        alert('Tack för ditt svar!');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Något gick fel. Försök igen.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Svara på mötesförfrågan</h1>
      <p className="mb-4">Välj tider som passar dig ({duration} minuter):</p>
      
      <div className="space-y-2">
        {slots.map((slot, index) => (
          <label key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedSlots.includes(slot)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSlots([...selectedSlots, slot]);
                } else {
                  setSelectedSlots(selectedSlots.filter(s => s !== slot));
                }
              }}
              className="form-checkbox"
            />
            <span>
              {new Date(slot.start).toLocaleString('sv-SE')} - 
              {new Date(slot.end).toLocaleString('sv-SE')}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmitResponse}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Skicka svar
      </button>
    </div>
  );
}
