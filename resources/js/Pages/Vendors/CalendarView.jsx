// resources/js/Components/CalendarView.jsx
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const events = [
  {
    title: 'Toyota Voxy Booking',
    start: new Date('2025-05-23T10:00:00'),
    end: new Date('2025-05-23T14:00:00'),
  },
  {
    title: 'Bus Rental',
    start: new Date('2025-05-25T09:00:00'),
    end: new Date('2025-05-25T17:00:00'),
  },
];

const CalendarView = () => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-hidden">
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day']}
          popup
          selectable
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
