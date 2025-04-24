"use client";

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import Button from './ui/Button';

export default function SchedulingAssistant({ attendees, onTimeSelect, darkMode }) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const findAvailableSlots = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendees,
          dateRange: {
            start: dateRange[0],
            end: dateRange[1]
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch availability');
      
      const data = await response.json();
      const slots = processAvailability(data.calendars);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error finding available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Hitta lämplig mötestid</h2>
      
      <div className="mb-4">
        <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Välj datumintervall:
        </label>
        <DatePicker
          selectsRange
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={setDateRange}
          dateFormat="yyyy-MM-dd"
          className={`w-full p-2 border rounded ${
            darkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-300'
          }`}
        />
      </div>

      <div className="mb-4">
        <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Deltagare:</h3>
        <ul className="list-disc pl-5">
          {attendees.map((email, index) => (
            <li key={index} className={darkMode ? 'text-white' : 'text-gray-700'}>
              {email}
            </li>
          ))}
        </ul>
      </div>

      <Button 
        onClick={findAvailableSlots}
        disabled={loading || !dateRange[0] || !dateRange[1]}
      >
        {loading ? 'Söker...' : 'Hitta lediga tider'}
      </Button>

      {availableSlots.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Föreslagna tider:</h3>
          <div className="space-y-2">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => onTimeSelect(slot)}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                {formatTimeSlot(slot)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function processAvailability(calendars) {
  // Implementera logik för att hitta gemensamma lediga tider
  // baserat på kalendrarnas busy-perioder
}

function formatTimeSlot(slot) {
  return `${new Date(slot.start).toLocaleString('sv-SE')} - 
          ${new Date(slot.end).toLocaleString('sv-SE')}`;
}
