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

// Accept currentMonth and currentYear as props
const CalendarGrid = ({ times, events: initialEvents, proPicTwo, currentMonth, currentYear }) => {
  const [events, setEvents] = useState(initialEvents);
  const days = getDaysArray(currentYear, currentMonth);

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
      setEvents(
        events.map((e, idx) => (idx === eventIdx ? updatedEvent : e))
      );
    }
  };

  return (
    <>
      {/* Header Row */}
      <div className="border-b border-r border-[#00000026] bg-white flex justify-center items-center text-[#00000080] text-[14px] font-[500]">UTC +1</div>
      {days.map((day) => (
        <div key={day.date} className="border-b border-r border-[#00000026] flex flex-col items-center py-2">
          <span className="font-[700] text-[24px]">{day.date}</span>
          <span className="text-[14px] font-[500] text-[#00000080]">{day.label}</span>
        </div>
      ))}

      {/* Time Rows */}
      {times.map((time, rowIdx) => (
        <React.Fragment key={time}>
          {/* Time column */}
          <div className="relative border-[#00000026] bg-[#FFFFFF] h-[80px] text-[14px] text-[#7B7B7A] font-[500]">
            <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 mb-1">
              {time}
            </div>
          </div>
          {/* Day columns */}
          {days.map((day, colIdx) => {
            // Find all events for this cell
            const cellEvents = events.filter(
              (e) => e.day === colIdx && e.time === time
            );
            return (
              <div
                key={colIdx}
                className="border-b border-r border-l border-[#00000026] relative h-[100px] flex flex-col items-center justify-center gap-1 cursor-pointer"
                onClick={cellEvents.length === 0 ? () => handleAddEvent(colIdx, time) : undefined}
                style={{ background: cellEvents.length === 0 ? '#f9f9f9' : undefined }}
              >
                {cellEvents.map((event, idx) => {
                  // Find the index of this event in the events array
                  const eventIdx = events.findIndex(
                    (e) => e.day === colIdx && e.time === time && e.title === event.title && e.person === event.person && e.status === event.status
                  );
                  return (
                    <div
                      key={idx}
                      className={`w-[122px] h-[90px] rounded-[12px] px-3 py-2 flex flex-col justify-center items-center ${event.status === "done" ? "bg-[#C5E6F9]" : "bg-[#FFDBDF]"} cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(eventIdx);
                      }}
                    >
                      {/* Time */}
                      <span className="w-full text-start text-[12px] font-[500] text-[#000000B2] tracking-wide mb-1">
                        {event.time.replace(":", " : ")}
                      </span>
                      {/* Car Name */}
                      <span className="w-full text-left font-[500] text-[16px] text-[#000000B2]">
                        {event.title}
                      </span>
                      {/* Avatar and Name */}
                      <div className="flex flex-row items-start w-full mt-auto">
                        <img
                          src={proPicTwo}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover mr-2"
                        />
                        <span className="text-[12px] font-[500] text-[#000000B2]">{event.person}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default CalendarGrid; 