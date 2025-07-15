// EventCalendarContainer.tsx
import EventCalendarClient from "./EventCalendarClient";

type Props = {
  searchParams: { [key: string]: string | undefined };
};

const EventCalendarContainer = async ({ searchParams }: Props) => {
  const dateParam = searchParams.date;
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <EventCalendarClient selectedDate={selectedDate} />
    </div>
  );
};

export default EventCalendarContainer;
