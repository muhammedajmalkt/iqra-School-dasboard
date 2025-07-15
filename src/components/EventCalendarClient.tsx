"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Props = {
  selectedDate?: Date;
  onChange?: (date: Date) => void;
};

const EventCalendarClient = ({ selectedDate, onChange }: Props) => {
  const [value, setValue] = useState<Date | null>(null);

  useEffect(() => {
    setValue(selectedDate ?? new Date());
  }, [selectedDate]);

  const handleChange = (date: Date) => {
    setValue(date);
    if (onChange) onChange(date);
  };

  if (!value) {
    return (
      <div className="w-full text-center py-10">
        <span className="text-gray-500 text-sm">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="react-calendar-wrapper bg-white rounded-lg shadow p-4">
      <Calendar
        value={value}
        onChange={handleChange}
        className="w-full text-sm"
        tileClassName={({ date }) =>
          date.toDateString() === new Date().toDateString()
            ? "bg-yellow-200 rounded-full font-semibold"
            : ""
        }
      />
    </div>
  );
};

export default EventCalendarClient;