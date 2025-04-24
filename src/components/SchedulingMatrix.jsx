"use client";

import { useState } from 'react';

export default function SchedulingMatrix({ 
  darkMode, 
  startDate, 
  endDate, 
  availableSlots,
  busySlots,
  onTimeSelected 
}) {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const generateTimeSlots = () => {
    const slots = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const daySlots = [];
      const day = new Date(current);
      
      // Generera 30-minuters slots för dagen
      for (let hour = 8; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          day.setHours(hour, minute);
          daySlots.push(new Date(day));
        }
      }
      
      slots.push({
        date: new Date(current),
        timeSlots: daySlots
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return slots;
  };

  const isSlotAvailable = (datetime) => {
    return availableSlots.some(slot => 
      new Date(slot.start).getTime() === datetime.getTime()
    );
  };

  const isSlotBusy = (datetime) => {
    return busySlots.some(slot => 
      datetime >= new Date(slot.start) && 
      datetime < new Date(slot.end)
    );
  };

  const handleMouseDown = (datetime) => {
    if (isSlotAvailable(datetime)) {
      setDragStart(datetime);
      setDragEnd(datetime);
    }
  };

  const handleMouseMove = (datetime) => {
    if (dragStart && isSlotAvailable(datetime)) {
      setDragEnd(datetime);
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      onTimeSelected({
        start: dragStart,
        end: new Date(dragEnd.getTime() + 30 * 60000)
      });
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
        {/* Tidskolumn */}
        <div className="sticky left-0 bg-inherit">
          <div className="h-8" /> {/* Tom cell för datumrubriker */}
          {Array.from({ length: 26 }, (_, i) => (
            <div key={i} className="h-6 pr-2 text-right text-sm">
              {`${String(Math.floor(i/2 + 8)).padStart(2, '0')}:${i%2 ? '30' : '00'}`}
            </div>
          ))}
        </div>

        {/* Dagkolumner */}
        {timeSlots.map(({ date, timeSlots }) => (
          <div key={date.toISOString()}>
            <div className="h-8 text-center font-semibold border-b">
              {date.toLocaleDateString('sv-SE', { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </div>
            {timeSlots.map(slot => (
              <div
                key={slot.toISOString()}
                className={`h-6 border ${
                  isSlotBusy(slot)
                    ? darkMode ? 'bg-red-900/50' : 'bg-red-100'
                    : isSlotAvailable(slot)
                      ? darkMode ? 'bg-green-900/50' : 'bg-green-100'
                      : ''
                } ${
                  dragStart && dragEnd && 
                  slot >= dragStart && 
                  slot <= dragEnd
                    ? 'bg-blue-500'
                    : ''
                }`}
                onMouseDown={() => handleMouseDown(slot)}
                onMouseEnter={() => handleMouseMove(slot)}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
