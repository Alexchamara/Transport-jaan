import React, { useState } from "react";
import dropdown from "../../../assets/vendors/calendar/dropDown.svg"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const CalendarMonthPicker = () => {
  // October 2024 as default
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(9); // 0-indexed, 9 = October
  const [selectedDay, setSelectedDay] = useState(6);

  // For dropdown
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // For grid: get previous month's trailing days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevMonthYear, prevMonth);
  const leadingEmpty = (firstDay + 6) % 7; // Make Sunday first

  // Build calendar grid
  let calendarDays = [];
  // Previous month's days
  for (let i = leadingEmpty - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      current: false,
      key: `prev-${prevMonthDays - i}`
    });
  }
  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      current: true,
      key: `curr-${i}`
    });
  }
  // Next month's days
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({
      day: calendarDays.length - daysInMonth - leadingEmpty + 1,
      current: false,
      key: `next-${calendarDays.length}`
    });
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  // Dropdown handlers
  const handleYearSelect = (y) => {
    setYear(y);
    setShowYearDropdown(false);
    setSelectedDay(null);
  };
  const handleMonthSelect = (m) => {
    setMonth(m);
    setShowMonthDropdown(false);
    setSelectedDay(null);
  };

  // Years for dropdown
  const years = [];
  for (let y = year - 5; y <= year + 5; y++) years.push(y);

  return (
    <div className="w-full h-auto flex flex-col items-center">
      {/* Header: Year, Month, Arrows */}
      <div className="flex flex-row justify-between items-center w-full mb-4">
        {/* Year dropdown */}
        <div className="relative">
          <button
            className="text-[12px] font-[500] text-[#424242] px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setShowYearDropdown((v) => !v)}
          >
            {year}
            <span className="ml-1 text-gray-400"><img src={dropdown} /></span>
          </button>
          {showYearDropdown && (
            <div className="absolute z-10 bg-white border rounded shadow w-[80px] max-h-[180px] overflow-y-auto mt-1">
              {years.map((y) => (
                <div
                  key={y}
                  className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${y === year ? "font-bold bg-gray-50" : ""}`}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Month navigation */}
        <div className="flex flex-row items-center gap-2">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
          >
            <span className="text-xl">&#60;</span>
          </button>
          <div className="relative">
            <button
              className="text-[12px] text-[#424242] font-[500] px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
              onClick={() => setShowMonthDropdown((v) => !v)}
            >
              {months[month]}
            </button>
            {/* {showMonthDropdown && (
              <div className="absolute z-10 bg-white border rounded w-[120px] max-h-[180px] overflow-y-auto mt-1">
                {months.map((m, idx) => (
                  <div
                    key={m}
                    className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${idx === month ? "font-bold bg-gray-50" : ""}`}
                    onClick={() => handleMonthSelect(idx)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )} */}
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            <span className="text-xl">&#62;</span>
          </button>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="w-full grid grid-cols-7 gap-y-1">
        <div className="col-span-7 grid grid-cols-7 bg-[#F8F8F8] rounded-lg p-2">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-[400] text-[#757575] py-1"
            >
              {d}
            </div>
          ))}
        </div>
        {calendarDays.map(({ day, current, key }, idx) => (
          <div
            key={key}
            className={`flex items-center justify-center text-[12px] font-[400] h-10 w-10 m-auto my-1 rounded-full cursor-pointer
              ${current ? "text-[#424242]" : "text-gray-300"}
              ${current && day === selectedDay ? "bg-[#0955AC] text-[#FFFFFF] font-[700]" : ""}
              ${current && day !== selectedDay ? "hover:bg-[#E5EFFF]" : ""}
            `}
            onClick={() => current && setSelectedDay(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarMonthPicker; 