'use client';
import { useState } from "react";
import Calendar from "react-calendar";

const EventCalendar = () => {
  const [value, setValue] = useState<Date>(new Date());

  return (
    <Calendar
      value={value}
      onChange={setValue}
      className="rounded-md shadow-sm"
    />
  );
};

export default EventCalendar;
