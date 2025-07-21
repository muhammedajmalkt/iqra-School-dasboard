// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

import { Prisma } from "@prisma/client";

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

type ClerkError = {
  clerkError: boolean;
  errors: { message: string }[];
};

type KnownPrismaError = Prisma.PrismaClientKnownRequestError & {
  code: string;
  meta?: any;
};

type UnknownError = {
  message?: string;
};

export const createErrorMessage = (
  err: ClerkError | KnownPrismaError | UnknownError | unknown
): string => {
  console.error("Caught error:", err);

  let errorMessage = "Something went wrong!";

  if (
    typeof err === "object" &&
    err !== null &&
    "clerkError" in err &&
    Array.isArray((err as ClerkError).errors)
  ) {
    // Clerk error
    errorMessage = (err as ClerkError).errors[0]?.message || errorMessage;
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string"
  ) {
    const prismaError = err as KnownPrismaError;

    switch (prismaError.code) {
      case "P2002":
        errorMessage = `A record with the same ${prismaError.meta?.target} already exists.`;
        break;
      case "P2003":
        const field = prismaError.meta?.field_name;
        errorMessage = `Foreign key constraint failed on ${field}. Make sure related data exists.`;
        break;
      case "P2025":
        errorMessage = `Record to update/delete does not exist.`;
        break;
      default:
        errorMessage = `Database error [${prismaError.code}]: ${prismaError.message}`;
        break;
    }
  } else if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as any).message === "string"
  ) {
    errorMessage = (err as { message: string }).message;
  }

  return errorMessage;
};
