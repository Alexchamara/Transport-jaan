import React, { useState } from "react";

function getDaysArray(year, month) {
  // Get the first day of the week for the month (0=Sunday, 1=Monday, ...)
  const firstDay = new Date(year, month, 1).getDay();
  // Get the number of days in the month
  const numDays = new Date(year, month + 1, 0).getDate();
  // Build the days array (Monday as first day)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Find the date of the first Monday in the month view
  let startDate = 1 - ((firstDay + 6) % 7);
  let days = [];
  for (let i = 0; i < 7; i++) {
    const date = startDate + i;
    days.push({
      label: daysOfWeek[i],
      date: date > 0 && date <= numDays ? date : null,
    });
  }
  return days;
}

function getWeekDays(year, month, day) {
  const currentDate = new Date(year, month, day);
  const dayOfWeek = currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - ((dayOfWeek + 6) % 7));
  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      label: daysOfWeek[i],
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
    });
  }
  return days;
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const numDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  const startDay = (firstDay + 6) % 7; // Monday = 0
  const weeks = [];
  let currentWeek = [];
  
  // Previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    currentWeek.push({
      date: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  
  // Current month days
  for (let date = 1; date <= numDays; date++) {
    currentWeek.push({
      date,
      month,
      year,
      isCurrentMonth: true,
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Next month days
  let nextMonthDate = 1;
  while (currentWeek.length < 7) {
    currentWeek.push({
      date: nextMonthDate++,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
}

// Accept currentMonth, currentYear, currentDay, and currentView as props
const CalendarGrid = ({
  times,
  events: initialEvents,
  proPicTwo,
  currentMonth,
  currentYear,
  currentDay,
  currentView,
}) => {
  const [events, setEvents] = useState(initialEvents);
  
  const days = currentView === 'week' 
    ? getWeekDays(currentYear, currentMonth, currentDay)
    : getDaysArray(currentYear, currentMonth);
  
  const monthGrid = currentView === 'month' ? getMonthGrid(currentYear, currentMonth) : [];
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  // Helper function to get events for a specific date
  const getEventsForDate = (year, month, date) => {
    // For week view, match events by day index
    if (currentView === 'week') {
      const targetDate = new Date(year, month, date);
      const weekStart = new Date(currentYear, currentMonth, currentDay);
      const weekStartDay = weekStart.getDay();
      const monday = new Date(weekStart);
      monday.setDate(weekStart.getDate() - ((weekStartDay + 6) % 7));
      
      const dayIndex = Math.floor((targetDate - monday) / (1000 * 60 * 60 * 24));
      return events.filter(e => e.day === dayIndex);
    }
    
    // For other views, we need to map events to actual dates
    // Since the events use day indices (0-6), we'll map them to the current week being viewed
    const weekStart = new Date(currentYear, currentMonth, currentDay);
    const weekStartDay = weekStart.getDay();
    const monday = new Date(weekStart);
    monday.setDate(weekStart.getDate() - ((weekStartDay + 6) % 7));
    
    return events.filter(e => {
      const eventDate = new Date(monday);
      eventDate.setDate(monday.getDate() + e.day);
      return eventDate.getDate() === date && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  // Handler to add a new event
  const handleAddEvent = (dayIdx, time) => {
    const title = window.prompt("Enter event title:");
    if (!title) return;
    const person = window.prompt("Enter person name:");
    if (!person) return;
    const status = window.prompt("Enter status (done/pending):", "pending");
    const newEvent = {
      day: dayIdx,
      time,
      title,
      person,
      status: status === "done" ? "done" : "pending",
    };
    setEvents([...events, newEvent]);
  };

  // Handler to edit or delete an event
  const handleEditEvent = (eventIdx) => {
    const event = events[eventIdx];
    const action = window.prompt(
      `Edit or delete event? (edit/delete)\nCurrent title: ${event.title}`,
      "edit"
    );
    if (action === "delete") {
      setEvents(events.filter((_, idx) => idx !== eventIdx));
      return;
    }
    if (action === "edit") {
      const title = window.prompt("Edit event title:", event.title);
      if (!title) return;
      const person = window.prompt("Edit person name:", event.person);
      if (!person) return;
      const status = window.prompt("Edit status (done/pending):", event.status);
      const updatedEvent = {
        ...event,
        title,
        person,
        status: status === "done" ? "done" : "pending",
      };
      setEvents(events.map((e, idx) => (idx === eventIdx ? updatedEvent : e)));
    }
  };

  // DAY VIEW
  if (currentView === 'day') {
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentDate.getDay()];
    const dayEvents = getEventsForDate(currentYear, currentMonth, currentDay);
    
    return (
      <>
        {/* DESKTOP/TABLET DAY VIEW */}
        <div className="hidden md:contents">
          {/* Header Row */}
          <div className="border-b border-r border-[#00000026] bg-white flex justify-center items-center text-[#00000080] text-[14px] font-[500]">
            UTC +1
          </div>
          <div className="border-b border-r border-[#00000026] flex flex-col items-center py-2 col-span-7">
            <span className="font-[700] text-[24px]">{currentDay}</span>
            <span className="text-[14px] font-[500] text-[#00000080]">{dayName}</span>
          </div>

          {/* Time Rows */}
          {times.map((time) => {
            const timeEvents = dayEvents.filter(e => e.time === time);
            return (
              <React.Fragment key={time}>
                <div className="border-[#00000026] bg-[#FFFFFF] h-[120px] text-[14px] text-[#7B7B7A] font-[500] flex items-center justify-center">
                  {time}
                </div>
                <div className="border-b border-r border-l border-[#00000026] relative h-[120px] flex items-center justify-center col-span-7 gap-3 p-2" style={{ background: timeEvents.length === 0 ? '#f9f9f9' : 'white' }}>
                  {timeEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={`w-[122px] h-[88px] rounded-[12px] px-3 py-2 flex flex-col justify-between ${
                        event.status === "done"
                          ? "bg-[#C5E6F9]"
                          : "bg-[#FFDBDF]"
                      }`}
                    >
                      <span className="w-full text-start text-[12px] font-[500] text-[#000000B2] tracking-wide">
                        {event.time.replace(":", " : ")}
                      </span>
                      <span className="w-full text-left font-[500] text-[16px] text-[#000000B2]">
                        {event.title}
                      </span>
                      <div className="flex flex-row items-center w-full">
                        <img
                          src={proPicTwo}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover mr-2"
                        />
                        <span className="text-[12px] font-[500] text-[#000000B2]">
                          {event.person}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* MOBILE DAY VIEW */}
        <div className="md:hidden w-full px-5">
          <div className="mb-4 rounded-[12px] border border-[#00000026] bg-white p-3">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-[700] text-[22px]">{currentDay}</span>
                <span className="text-[14px] font-[500] text-[#00000080]">{dayName}</span>
              </div>
            </div>
            <div className="space-y-2">
              {times.map((time) => {
                const timeEvents = dayEvents.filter(e => e.time === time);
                return (
                  <div key={time} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-[500] text-[#7B7B7A]">{time}</span>
                    </div>
                    {timeEvents.length > 0 ? (
                      <div className="space-y-2">
                        {timeEvents.map((event, idx) => (
                          <div
                            key={idx}
                            className={`w-full rounded-[12px] px-3 py-2 flex flex-col justify-center ${
                              event.status === "done"
                                ? "bg-[#C5E6F9]"
                                : "bg-[#FFDBDF]"
                            }`}
                          >
                            <span className="w-full text-start text-[11px] font-[500] text-[#000000B2] tracking-wide mb-1">
                              {event.time.replace(":", " : ")}
                            </span>
                            <span className="w-full text-left font-[500] text-[15px] text-[#000000B2]">
                              {event.title}
                            </span>
                            <div className="flex flex-row items-center w-full mt-2">
                              <img
                                src={proPicTwo}
                                alt="avatar"
                                className="w-6 h-6 rounded-full object-cover mr-2"
                              />
                              <span className="text-[12px] font-[500] text-[#000000B2]">
                                {event.person}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full rounded-[8px] border border-dashed border-[#00000026] px-2 py-2 text-[11px] text-[#999999]">
                        No events
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // MONTH VIEW
  if (currentView === 'month') {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    return (
      <div className="w-full px-5 md:px-10 py-5">
        <div className="bg-white rounded-[12px] border border-[#00000026] overflow-hidden shadow-sm">
          {/* Month grid header */}
          <div className="grid grid-cols-7">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center py-4 text-[16px] font-[700] text-[#000000B2] bg-[#F8F9FA] border-r border-b border-[#00000026] last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Month grid body */}
          {monthGrid.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7">
              {week.map((day, dayIdx) => {
                const dayEvents = getEventsForDate(day.year, day.month, day.date);
                return (
                  <div
                    key={dayIdx}
                    className={`min-h-[120px] md:min-h-[140px] p-2 border-r border-b border-[#00000026] last:border-r-0 transition-colors hover:bg-[#F8F9FA] cursor-pointer overflow-hidden ${
                      !day.isCurrentMonth ? 'bg-[#FAFAFA] text-[#00000040]' : 'bg-white'
                    } ${
                      day.date === currentDay && day.month === currentMonth && day.isCurrentMonth
                        ? 'bg-[#E3F2FD] ring-2 ring-inset ring-[#0955AC]'
                        : ''
                    }`}
                  >
                    <div className={`text-[14px] font-[600] mb-1 ${
                      day.date === currentDay && day.month === currentMonth && day.isCurrentMonth
                        ? 'text-[#0955AC]'
                        : ''
                    }`}>
                      {day.date}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className={`w-full rounded-[4px] px-2 py-1 text-[10px] font-[500] truncate ${
                            event.status === "done"
                              ? "bg-[#C5E6F9] text-[#000000B2]"
                              : "bg-[#FFDBDF] text-[#000000B2]"
                          }`}
                          title={`${event.time} - ${event.title} (${event.person})`}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-[#0955AC] font-[600] pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // YEAR VIEW
  if (currentView === 'year') {
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    const getMiniMonthGrid = (month) => {
      const firstDay = new Date(currentYear, month, 1).getDay();
      const numDays = new Date(currentYear, month + 1, 0).getDate();
      const startDay = (firstDay + 6) % 7;
      const weeks = [];
      let currentWeek = new Array(startDay).fill(null);
      
      for (let date = 1; date <= numDays; date++) {
        currentWeek.push(date);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
      }
      return weeks;
    };
    
    return (
      <div className="w-full px-5 md:px-10 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month) => {
            const miniGrid = getMiniMonthGrid(month);
            const isCurrentMonth = month === currentMonth;
            
            return (
              <div
                key={month}
                className={`bg-white rounded-[12px] border p-4 ${
                  isCurrentMonth ? 'border-[#0955AC] shadow-lg' : 'border-[#00000026]'
                }`}
              >
                <h3 className={`text-center text-[16px] font-[700] mb-3 ${
                  isCurrentMonth ? 'text-[#0955AC]' : 'text-[#000000]'
                }`}>
                  {monthNames[month]}
                </h3>
                
                <div className="grid grid-cols-7 gap-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] font-[600] text-[#00000080] pb-1">
                      {day}
                    </div>
                  ))}
                  
                  {miniGrid.map((week, weekIdx) => (
                    <React.Fragment key={weekIdx}>
                      {week.map((date, dateIdx) => {
                        const hasEvents = date ? getEventsForDate(currentYear, month, date).length > 0 : false;
                        return (
                          <div
                            key={dateIdx}
                            className={`text-center text-[12px] py-1 rounded relative ${
                              date === null
                                ? ''
                                : date === currentDay && month === currentMonth
                                ? 'bg-[#0955AC] text-white font-[700]'
                                : 'hover:bg-[#F3F3F3] cursor-pointer'
                            }`}
                          >
                            {date || ''}
                            {hasEvents && date && (
                              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                                date === currentDay && month === currentMonth
                                  ? 'bg-white'
                                  : 'bg-[#0955AC]'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // WEEK VIEW (default)
  return (
    <>
      {/* DESKTOP/TABLET GRID */}
      <div className="hidden md:contents">
        {/* Header Row */}
        <div className="border-b border-r border-[#00000026] bg-white flex justify-center items-center text-[#00000080] text-[14px] font-[500]">
          UTC +1
        </div>
        {days.map((day) => (
          <div
            key={`${day.label}-${day.date}`}
            className="border-b border-r border-[#00000026] flex flex-col items-center py-2"
          >
            <span className="font-[700] text-[24px]">
              {day.date !== null ? day.date : ""}
            </span>
            <span className="text-[14px] font-[500] text-[#00000080]">
              {day.label}
            </span>
          </div>
        ))}

        {/* Time Rows */}
        {times.map((time) => (
          <React.Fragment key={time}>
            {/* Time column – fixed row height */}
            <div className="border-[#00000026] bg-[#FFFFFF] h-[120px] text-[14px] text-[#7B7B7A] font-[500] flex items-center justify-center">
              {time}
            </div>

            {/* Day columns – same fixed row height */}
            {days.map((day, colIdx) => {
              const cellEvents = events.filter(
                (e) => e.day === colIdx && e.time === time
              );
              return (
                <div
                  key={colIdx}
                  className="border-b border-r border-l border-[#00000026] relative h-[120px] flex items-center justify-center cursor-pointer"
                  onClick={
                    cellEvents.length === 0
                      ? () => handleAddEvent(colIdx, time)
                      : undefined
                  }
                  style={{
                    background: cellEvents.length === 0 ? "#f9f9f9" : undefined,
                  }}
                >
                  {cellEvents.map((event, idx) => {
                    const eventIdx = events.findIndex(
                      (e) =>
                        e.day === colIdx &&
                        e.time === time &&
                        e.title === event.title &&
                        e.person === event.person &&
                        e.status === event.status
                    );
                    return (
                      <div
                        key={idx}
                        className={`w-[122px] h-[88px] rounded-[12px] px-3 py-2 flex flex-col justify-between ${
                          event.status === "done"
                            ? "bg-[#C5E6F9]"
                            : "bg-[#FFDBDF]"
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(eventIdx);
                        }}
                      >
                        {/* Time */}
                        <span className="w-full text-start text-[12px] font-[500] text-[#000000B2] tracking-wide">
                          {event.time.replace(":", " : ")}
                        </span>
                        {/* Car Name */}
                        <span className="w-full text-left font-[500] text-[16px] text-[#000000B2]">
                          {event.title}
                        </span>
                        {/* Avatar and Name */}
                        <div className="flex flex-row items-center w-full">
                          <img
                            src={proPicTwo}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover mr-2"
                          />
                          <span className="text-[12px] font-[500] text-[#000000B2]">
                            {event.person}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* MOBILE VIEW (unchanged) */}
      <div className="md:hidden w-[275px]">
        <div className="mb-2 text-[14px] font-[500] text-[#00000080]">
          UTC +1
        </div>

        {days
          .map((day, dayIdx) => ({ ...day, dayIdx }))
          .filter((d) => d.date !== null)
          .map((day) => (
            <div
              key={`${day.label}-${day.date}`}
              className="mb-4 rounded-[12px] border border-[#00000026] bg-white p-3"
            >
              {/* Day header */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-[700] text-[22px]">{day.date}</span>
                  <span className="text-[14px] font-[500] text-[#00000080]">
                    {day.label}
                  </span>
                </div>
              </div>

              {/* Time slots & events */}
              <div className="space-y-2">
                {times.map((time) => {
                  const cellEvents = events.filter(
                    (e) => e.day === day.dayIdx && e.time === time
                  );

                  return (
                    <div key={time} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-[500] text-[#7B7B7A]">
                          {time}
                        </span>
                        {cellEvents.length === 0 && (
                          <button
                            className="text-[11px] font-[500] text-[#3B82F6]"
                            onClick={() => handleAddEvent(day.dayIdx, time)}
                          >
                            + Add
                          </button>
                        )}
                      </div>

                      {cellEvents.length > 0 ? (
                        cellEvents.map((event, idx) => {
                          const eventIdx = events.findIndex(
                            (e) =>
                              e.day === day.dayIdx &&
                              e.time === time &&
                              e.title === event.title &&
                              e.person === event.person &&
                              e.status === event.status
                          );
                          return (
                            <div
                              key={idx}
                              className={`w-full rounded-[12px] px-3 py-2 flex flex-col justify-center ${
                                event.status === "done"
                                  ? "bg-[#C5E6F9]"
                                  : "bg-[#FFDBDF]"
                              } cursor-pointer`}
                              onClick={() => handleEditEvent(eventIdx)}
                            >
                              {/* Time */}
                              <span className="w-full text-start text-[11px] font-[500] text-[#000000B2] tracking-wide mb-1">
                                {event.time.replace(":", " : ")}
                              </span>
                              {/* Title */}
                              <span className="w-full text-left font-[500] text-[15px] text-[#000000B2]">
                                {event.title}
                              </span>
                              {/* Avatar and Name */}
                              <div className="flex flex-row items-center w-full mt-2">
                                <img
                                  src={proPicTwo}
                                  alt="avatar"
                                  className="w-6 h-6 rounded-full object-cover mr-2"
                                />
                                <span className="text-[12px] font-[500] text-[#000000B2]">
                                  {event.person}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="w-full rounded-[8px] border border-dashed border-[#00000026] px-2 py-2 text-[11px] text-[#999999] cursor-pointer"
                          onClick={() => handleAddEvent(day.dayIdx, time)}
                        >
                          Tap to add event
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default CalendarGrid;
