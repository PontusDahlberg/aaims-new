"use client";

import { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function CalendarOverview({ 
  darkMode, 
  dateRange,
  onTimeSelect,
  onClose,
  workHours = { start: 8, end: 21 }
}) {
  const [events, setEvents] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Skapa tidsintervaller för ett helt dygn (00:00-24:00)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return {
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isWorkHour: hour >= workHours.start && hour < workHours.end
    };
  });

  // Hämta händelser
  useEffect(() => {
    fetchEvents();
  }, [dateRange]);

  const fetchEvents = async () => {
    if (!dateRange?.[0] || !dateRange?.[1]) return;
    
    try {
      const response = await fetch('/api/calendar-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange[0],
          endDate: dateRange[1]
        })
      });

      if (!response.ok) throw new Error('Kunde inte hämta kalenderhändelser');
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCellSelect = (date, time, isWorkHour) => {
    if (!isWorkHour || isDragging) return;
    
    const selectedDateTime = combineDateTime(date, time);
    if (!selectedRange) {
      setSelectedRange({ start: selectedDateTime, current: selectedDateTime });
      setIsDragging(true);
    } else {
      // Uppdatera intervallet under dragning
      setSelectedRange(prev => ({
        ...prev,
        current: selectedDateTime
      }));
    }
  };

  const handleMouseUp = () => {
    if (selectedRange) {
      const finalRange = {
        start: new Date(Math.min(selectedRange.start, selectedRange.current)),
        end: new Date(Math.max(selectedRange.start, selectedRange.current) + 30 * 60000)
      };
      setSelectedRange(finalRange);
    }
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className={`w-[90vw] h-[90vh] ${darkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Kalenderöversikt</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-px min-w-[800px]">
            {/* Tidkolumn */}
            <div className="sticky left-0 bg-inherit z-10">
              <div className="h-10" /> {/* Header spacing */}
              {timeSlots.map(({ time, isWorkHour }) => (
                <div 
                  key={time} 
                  className={`h-8 pr-2 text-right text-sm whitespace-nowrap 
                    ${isWorkHour ? 'font-medium' : 'text-gray-400'}`}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Dagkolumner */}
            {getDaysBetween(dateRange[0], dateRange[1]).map(date => (
              <div key={date.toISOString()} className="relative">
                <div className="h-10 font-semibold text-center border-b sticky top-0 bg-inherit z-10">
                  {formatDate(date)}
                </div>
                
                {timeSlots.map(({ time, isWorkHour }) => (
                  <div
                    key={`${date}-${time}`}
                    className={`h-8 relative ${
                      isWorkHour 
                        ? darkMode ? 'bg-gray-700' : 'bg-white' 
                        : darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    } ${
                      isInSelectedRange(date, time, selectedRange)
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : ''
                    }`}
                    onMouseDown={() => handleCellSelect(date, time, isWorkHour)}
                    onMouseEnter={() => isDragging && handleCellSelect(date, time, isWorkHour)}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: isWorkHour ? 'pointer' : 'default' }}
                  >
                    {getEventForTimeSlot(date, time, events)?.map(event => (
                      <div
                        key={event.id}
                        className={`absolute left-0 right-0 overflow-hidden text-xs p-1
                          ${darkMode ? 'bg-purple-700' : 'bg-purple-200'}`}
                        style={{
                          top: 0,
                          height: `${calculateEventHeight(event)}px`
                        }}
                        title={`${event.summary}\n${formatTimeRange(event)}`}
                      >
                        {event.summary}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {selectedRange && (
          <div className="border-t p-4 flex justify-end space-x-2">
            <Button onClick={() => onTimeSelect(selectedRange)}>
              Välj tid
            </Button>
            <Button 
              onClick={() => {
                setSelectedRange(null);
                onClose();
              }}
              className="bg-gray-500"
            >
              Avbryt
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Hjälpfunktioner
function getDaysBetween(start, end) {
  if (!start || !end) return [];
  const days = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatDate(date) {
  return date.toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });
}

function combineDateTime(date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function isInSelectedRange(date, time, selectedRange) {
  if (!selectedRange) return false;
  const cellTime = combineDateTime(date, time);
  return cellTime >= selectedRange.start && cellTime < selectedRange.end;
}

function getEventForTimeSlot(date, time, events) {
  return events.filter(event => {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    const cellTime = combineDateTime(date, time);
    return cellTime >= eventStart && cellTime < eventEnd;
  });
}

function calculateEventHeight(event) {
  const eventStart = new Date(event.start.dateTime);
  const eventEnd = new Date(event.end.dateTime);
  return (eventEnd - eventStart) / (30 * 60000) * 8; // 8px per 30 min
}

function formatTimeRange(event) {
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  return `${start.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
}
