"use client";

import { useState } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import sv from 'date-fns/locale/sv';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('sv', sv);

export default function DatePicker({ onChange, darkMode, workdayStart = "08:00", workdayEnd = "21:00" }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Konvertera arbetstider till Date-objekt
  const getWorkHours = () => {
    const [startHour, startMinute] = workdayStart.split(':').map(Number);
    const [endHour, endMinute] = workdayEnd.split(':').map(Number);
    
    const minTime = new Date();
    minTime.setHours(startHour, startMinute);
    
    const maxTime = new Date();
    maxTime.setHours(endHour, endMinute);
    
    return { minTime, maxTime };
  };

  const { minTime, maxTime } = getWorkHours();

  return (
    <div className={`${darkMode ? 'dark-datepicker' : ''}`}>
      <ReactDatePicker
        selected={startDate}
        onChange={(dates) => {
          const [start, end] = dates;
          setStartDate(start);
          setEndDate(end);
          if (start && end) {
            onChange({ start, end });
          }
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        showTimeSelect
        minTime={minTime}
        maxTime={maxTime}
        timeFormat="HH:mm"
        timeIntervals={30}
        locale="sv"
        dateFormat="yyyy-MM-dd HH:mm"
        placeholderText="Välj datum och tid"
        className={`w-full p-2 rounded border ${
          darkMode 
            ? 'bg-gray-700 text-white border-gray-600' 
            : 'bg-white text-gray-900 border-gray-300'
        }`}
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true,
              padding: 10
            }
          }
        ]}
        calendarClassName={`${darkMode ? 'dark-calendar' : ''} shadow-lg rounded-lg`}
      />

      <style jsx global>{`
        .dark-datepicker .react-datepicker {
          background-color: #1f2937;
          border-color: #374151;
          font-family: inherit;
        }
        .dark-datepicker .react-datepicker__header {
          background-color: #374151;
          border-bottom-color: #4b5563;
        }
        .dark-datepicker .react-datepicker__current-month,
        .dark-datepicker .react-datepicker__day-name,
        .dark-datepicker .react-datepicker__day {
          color: #fff;
        }
        .dark-datepicker .react-datepicker__day:hover {
          background-color: #4b5563;
        }
        .dark-datepicker .react-datepicker__day--selected,
        .dark-datepicker .react-datepicker__day--in-range {
          background-color: #6366f1;
          color: white;
        }
        .dark-datepicker .react-datepicker__day--in-selecting-range {
          background-color: #818cf8;
          color: white;
        }
        .dark-datepicker .react-datepicker__time-container {
          border-left-color: #374151;
        }
        .dark-datepicker .react-datepicker__time {
          background-color: #1f2937;
        }
        .dark-datepicker .react-datepicker__time-list-item:hover {
          background-color: #4b5563 !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #6366f1 !important;
        }
        .react-datepicker__day--in-range:not(.react-datepicker__day--range-end) {
          background-color: #6366f1 !important;
          opacity: 0.8;
        }
        .react-datepicker__day--range-end {
          background-color: #6366f1 !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
