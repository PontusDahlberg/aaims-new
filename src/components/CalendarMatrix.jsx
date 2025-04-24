"use client";

import { useState, useEffect } from 'react';
import Tooltip from './ui/Tooltip';
import Card from './ui/Card';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { sv } from 'date-fns/locale';

export default function CalendarMatrix({ 
  darkMode, 
  onTimeSelect, 
  onClose,
  workHours = { start: 8, end: 21 },
  duration = 60,
  attendees = []
}) {
  const [events, setEvents] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    startOfDay(new Date()),
    addDays(startOfDay(new Date()), 6)
  ]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchCalendarEvents();
    }
  }, [dateRange[0]?.toISOString(), dateRange[1]?.toISOString()]);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (update) => {
    if (Array.isArray(update) && update[0]) {
      const newEndDate = update[1] || addDays(update[0], 7);
      setDateRange([update[0], newEndDate]);
    }
  };

  const handleTimeClick = (date, time) => {
    const clickedDateTime = combineDateTime(date, time);

    if (!selectedStart) {
      setSelectedStart(clickedDateTime);
      setSelectedEnd(null);
    } else if (!selectedEnd) {
      if (clickedDateTime > selectedStart) {
        setSelectedEnd(clickedDateTime);
        setSelectedSlot({
          start: selectedStart,
          end: new Date(clickedDateTime.getTime() + 30 * 60000)
        });
      } else {
        setSelectedStart(clickedDateTime);
        setSelectedEnd(null);
      }
    } else {
      setSelectedStart(clickedDateTime);
      setSelectedEnd(null);
      setSelectedSlot(null);
    }
  };

  const isTimeSelected = (date, time) => {
    if (!selectedStart) return false;
    const datetime = combineDateTime(date, time);
    
    if (!selectedEnd) {
      return datetime.getTime() === selectedStart.getTime();
    }
    
    return datetime >= selectedStart && datetime <= selectedEnd;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className={`relative w-[90vw] max-w-6xl h-[90vh] overflow-hidden rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
      }`}>
        <div className="absolute top-0 left-0 right-0 p-4 border-b border-gray-600 bg-inherit z-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Kalenderöversikt</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✕</button>
          </div>
          
          <div className="flex justify-center space-x-4">
            <DatePicker
              selected={dateRange[0]}
              onChange={handleDateRangeChange}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              selectsRange
              inline
              locale={sv}
              monthsShown={2}
              calendarStartDay={1}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              className="w-full"
            />
          </div>
        </div>

        <div className="absolute top-[380px] left-0 right-0 bottom-[76px] overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-200">
                <div className="sticky left-0 bg-inherit z-10">
                  <div className={`h-8 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } border-b border-gray-200`} />
                  {generateTimeSlots(workHours).map(({ time }) => (
                    <div 
                      key={time} 
                      className={`h-8 pr-2 text-right text-sm whitespace-nowrap border-b ${
                        darkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-white'
                      } border-gray-200`}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {getDaysBetween(dateRange[0], dateRange[1]).map(date => (
                  <div key={date.toISOString()} className="relative">
                    <div className={`h-8 font-semibold text-center sticky top-0 z-10 border-b ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    }`}>
                      {formatDate(date)}
                    </div>
                    
                    <div className="relative h-full">
                      {generateTimeSlots(workHours).map(({ time }) => (
                        <div
                          key={`${date.toISOString()}-${time}`}
                          className={`h-8 border-b relative ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          } ${
                            isTimeSelected(date, time)
                              ? 'bg-blue-200 dark:bg-blue-800'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          } cursor-pointer transition-colors`}
                          onClick={() => handleTimeClick(date, time)}
                        />
                      ))}

                      {events
                        .filter(event => isSameDay(date, new Date(event.start.dateTime)))
                        .map(event => {
                          const startTime = new Date(event.start.dateTime);
                          const endTime = new Date(event.end.dateTime);
                          const top = getPositionFromTime(startTime);
                          const height = getHeightFromDuration(startTime, endTime);
                          
                          return (
                            <div
                              key={event.id}
                              className={`absolute left-0 right-0 mx-1 px-1 text-xs truncate rounded ${
                                darkMode ? 'bg-purple-700' : 'bg-purple-200'
                              }`}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                zIndex: 20
                              }}
                              title={`${event.summary}\n${formatTimeRange(event.start.dateTime, event.end.dateTime)}`}
                            >
                              {event.summary}
                            </div>
                          );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-600 bg-inherit">
          {selectedSlot && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onTimeSelect(selectedSlot)}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
              >
                Välj tid
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateTimeSlots(workHours) {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        isWorkHour: hour >= workHours.start && hour < workHours.end
      });
    }
  }
  return slots;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });
}

function getDaysBetween(start, end) {
  const days = [];
  let current = new Date(start);
  const last = new Date(end);
  
  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getPositionFromTime(date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return (minutes - 6 * 60) * (32 / 30); // 32px per 30-minute slot
}

function getHeightFromDuration(start, end) {
  const duration = (end - start) / (1000 * 60); // duration in minutes
  return duration * (32 / 30); // 32px per 30-minute slot
}

function formatTimeRange(start, end) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function combineDateTime(date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
