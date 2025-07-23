// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

import { Prisma } from "@prisma/client";
import prisma from "./prisma";

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

export async function getUnseenAnnouncementCount(
  userId: string,
  role: string
): Promise<number> {
  const query: Prisma.AnnouncementWhereInput = {};
  console.log("role:", role);
  console.log("userId:", userId);
  switch (role) {
    case "admin":
      // Admin sees all announcements
      break;

    case "teacher":
      query.OR = [
        { classId: null },
        {
          class: {
            lessons: {
              some: {
                teacherId: userId,
              },
            },
          },
        },
      ];
      break;

    case "student":
      query.OR = [
        { classId: null },
        {
          class: {
            students: {
              some: {
                id: userId,
              },
            },
          },
        },
      ];
      break;

    case "parent":
      query.OR = [
        { classId: null },
        {
          class: {
            students: {
              some: {
                parentId: userId,
              },
            },
          },
        },
      ];
      break;

    default:
      // Unknown role
      return 0;
  }

  const unseenCount = await prisma.announcement.count({
    where: {
      ...query,
      views: {
        none: {
          userId,
        },
      },
    },
  });

  return unseenCount;
}

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
    // Clerk error handling
    const clerkError = err as ClerkError;
    const firstError = clerkError.errors[0];

<<<<<<< HEAD
    if (firstError && typeof firstError === "object" && "code" in firstError) {
      const errorCode = (firstError as any).code;
      switch (errorCode) {
        // Authentication errors
        case "authentication_invalid":
          errorMessage = "Invalid authentication credentials.";
          break;
        case "session_token_invalid":
          errorMessage = "Your session has expired. Please sign in again.";
          break;
        case "session_token_not_provided":
          errorMessage = "Authentication required. Please sign in.";
          break;
        case "session_revoked":
          errorMessage = "Your session has been revoked. Please sign in again.";
          break;
        case "session_token_and_uat_claim_check_failed":
          errorMessage = "Session verification failed. Please sign in again.";
          break;

        // Sign up errors
        case "form_identifier_exists":
          errorMessage = "An account with this email already exists.";
          break;
        case "form_password_pwned":
          errorMessage =
            "This password has been found in a data breach. Please choose a different password.";
          break;
        case "form_password_length_too_short":
          errorMessage =
            "Password is too short. Please use at least 8 characters.";
          break;
        case "form_password_not_strong_enough":
          errorMessage =
            "Password is not strong enough. Please include uppercase, lowercase, numbers, and special characters.";
          break;
        case "form_username_invalid_character":
          errorMessage =
            "Username contains invalid characters. Use only letters, numbers, and underscores.";
          break;
        case "form_username_invalid_length":
          errorMessage = "Username must be between 3 and 20 characters long.";
          break;

        // Sign in errors
        case "form_identifier_not_found":
          errorMessage = "No account found with this email address.";
          break;
        case "form_password_incorrect":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "form_code_incorrect":
          errorMessage = "Invalid verification code. Please try again.";
          break;
        case "verification_link_expired":
          errorMessage =
            "Verification link has expired. Please request a new one.";
          break;
        case "verification_failed":
          errorMessage = "Verification failed. Please try again.";
          break;

        // Rate limiting
        case "too_many_requests":
          errorMessage =
            "Too many attempts. Please wait a moment before trying again.";
          break;
        case "identifier_already_signed_in":
          errorMessage = "You are already signed in with this account.";
          break;

        // Email/Phone verification errors
        case "form_param_format_invalid":
          errorMessage = "Invalid email or phone number format.";
          break;
        case "verification_expired":
          errorMessage =
            "Verification code has expired. Please request a new one.";
          break;

        // OAuth errors
        case "oauth_access_denied":
          errorMessage = "Access was denied. Please try signing in again.";
          break;
        case "oauth_email_domain_reserved_by_saml":
          errorMessage =
            "This email domain is managed by your organization. Please use SSO to sign in.";
          break;

        // Organization errors
        case "not_allowed_access":
          errorMessage =
            "You don't have permission to access this organization.";
          break;
        case "authorization_invalid":
          errorMessage = "You don't have permission to perform this action.";
          break;

        // Two-factor authentication errors
        case "form_2fa_code_invalid":
          errorMessage = "Invalid two-factor authentication code.";
          break;
        case "form_backup_code_invalid":
          errorMessage = "Invalid backup code. Please try again.";
          break;

        // Account locked/banned
        case "user_locked":
          errorMessage =
            "Your account has been temporarily locked. Please contact support.";
          break;
        case "user_banned":
          errorMessage =
            "Your account has been suspended. Please contact support.";
          break;

        // Generic validation errors
        case "form_param_nil":
          errorMessage =
            "Required field is missing. Please fill in all required information.";
          break;
        case "form_param_unknown":
          errorMessage = "Unknown parameter provided.";
          break;
        case "form_param_max_length_exceeded":
          errorMessage = "Input is too long. Please shorten your entry.";
          break;

        // API/Client errors
        case "client_invalid":
          errorMessage =
            "Invalid client configuration. Please contact support.";
          break;
        case "environment_not_found":
          errorMessage =
            "Environment configuration error. Please contact support.";
          break;

        // Invitation errors
        case "invitation_invalid":
          errorMessage = "This invitation is invalid or has expired.";
          break;
        case "invitation_expired":
          errorMessage =
            "This invitation has expired. Please request a new one.";
          break;

        default:
          errorMessage = firstError.message || "Authentication error occurred.";
          break;
      }
    } else {
      errorMessage = firstError?.message || errorMessage;
    }
=======
    errorMessage = firstError?.message || errorMessage;
>>>>>>> main
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string"
  ) {
    const prismaError = err as KnownPrismaError;

    switch (prismaError.code) {
      // Common constraint errors
      case "P2000":
        errorMessage =
          "The provided value for the column is too long for the column's type.";
        break;
      case "P2001":
        errorMessage =
          "The record searched for in the where condition does not exist.";
        break;
      case "P2002":
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta.target.join(", ")
          : prismaError.meta?.target || "field";
        errorMessage = `A record with the same ${target} already exists.`;
        break;
      case "P2003":
        const field = prismaError.meta?.field_name;
        errorMessage = `Foreign key constraint failed on ${field}. Make sure related data exists.`;
        break;
      case "P2004":
        errorMessage = "A constraint failed on the database.";
        break;
      case "P2005":
        const storedValue = prismaError.meta?.database_value;
        errorMessage = `The value stored in the database is invalid: ${storedValue}`;
        break;
      case "P2006":
        const providedValue = prismaError.meta?.database_value;
        errorMessage = `The provided value is invalid: ${providedValue}`;
        break;
      case "P2007":
        errorMessage = "Data validation error.";
        break;
      case "P2008":
        errorMessage = "Failed to parse the query.";
        break;
      case "P2009":
        errorMessage = "Failed to validate the query.";
        break;
      case "P2010":
        errorMessage = "Raw query failed.";
        break;
      case "P2011":
        const constraint = prismaError.meta?.constraint;
        errorMessage = `Null constraint violation on ${constraint}`;
        break;
      case "P2012":
        const missingValue = prismaError.meta?.path;
        errorMessage = `Missing a required value at ${missingValue}`;
        break;
      case "P2013":
        const missingArgument = prismaError.meta?.argument_name;
        errorMessage = `Missing the required argument ${missingArgument}`;
        break;
      case "P2014":
        const relation = prismaError.meta?.relation_name;
        errorMessage = `The change would violate the required relation '${relation}'`;
        break;
      case "P2015":
        errorMessage = "A related record could not be found.";
        break;
      case "P2016":
        errorMessage = "Query interpretation error.";
        break;
      case "P2017":
        const relationField = prismaError.meta?.relation_name;
        errorMessage = `The records for relation '${relationField}' are not connected.`;
        break;
      case "P2018":
        const requiredConnectedRecords = prismaError.meta?.relation_name;
        errorMessage = `The required connected records for '${requiredConnectedRecords}' were not found.`;
        break;
      case "P2019":
        errorMessage = "Input error.";
        break;
      case "P2020":
        errorMessage = "Value out of range for the type.";
        break;
      case "P2021":
        const table = prismaError.meta?.table;
        errorMessage = `The table '${table}' does not exist in the current database.`;
        break;
      case "P2022":
        const column = prismaError.meta?.column;
        errorMessage = `The column '${column}' does not exist in the current database.`;
        break;
      case "P2023":
        errorMessage = "Inconsistent column data.";
        break;
      case "P2024":
        errorMessage =
          "Timed out fetching a new connection from the connection pool.";
        break;
      case "P2025":
        errorMessage = "Record to update/delete does not exist.";
        break;
      case "P2026":
        errorMessage =
          "The current database provider doesn't support a feature that the query used.";
        break;
      case "P2027":
        errorMessage =
          "Multiple errors occurred on the database during query execution.";
        break;
      case "P2028":
        errorMessage = "Transaction API error.";
        break;
      case "P2030":
        errorMessage = "Cannot find a fulltext index to use for the search.";
        break;
      case "P2031":
        errorMessage =
          "Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.";
        break;
      case "P2033":
        errorMessage =
          "A number used in the query does not fit into a 64 bit signed integer.";
        break;
      case "P2034":
        errorMessage =
          "Transaction failed due to a write conflict or a deadlock.";
        break;
      case "P2035":
        errorMessage = "Assertion violation on the database.";
        break;
      case "P2036":
        errorMessage = "Error in external connector.";
        break;
      case "P2037":
        errorMessage = "Too many database connections opened.";
        break;

      // Migration errors (P3xxx)
      case "P3000":
        errorMessage = "Failed to create database.";
        break;
      case "P3001":
        errorMessage =
          "Migration possible with destructive changes and possible data loss.";
        break;
      case "P3002":
        errorMessage = "The attempted migration was rolled back.";
        break;
      case "P3003":
        errorMessage =
          "The format of migrations changed, the saved migrations are no longer valid.";
        break;
      case "P3004":
        errorMessage =
          "The database is a system database, it should not be altered with prisma migrate.";
        break;
      case "P3005":
        errorMessage = "The database schema is not empty.";
        break;
      case "P3006":
        errorMessage =
          "Migration failed to apply cleanly to the shadow database.";
        break;
      case "P3007":
        errorMessage =
          "Some of the requested preview features are not yet allowed in migration engine.";
        break;
      case "P3008":
        errorMessage =
          "The migration is already recorded as applied in the database.";
        break;
      case "P3009":
        errorMessage =
          "migrate found failed migrations in the target database.";
        break;
      case "P3010":
        errorMessage = "The name of the migration is too long.";
        break;
      case "P3011":
        errorMessage =
          "Migration cannot be rolled back because it was never applied to the database.";
        break;
      case "P3012":
        errorMessage =
          "Migration cannot be rolled back because it is not in a failed state.";
        break;
      case "P3013":
        errorMessage = "Datasource provider arrays are no longer supported.";
        break;
      case "P3014":
        errorMessage = "Prisma Migrate could not create the shadow database.";
        break;
      case "P3015":
        errorMessage = "Could not find the migration file.";
        break;
      case "P3016":
        errorMessage = "The fallback method for database resets failed.";
        break;
      case "P3017":
        errorMessage = "The migration could not be found.";
        break;
      case "P3018":
        errorMessage = "A migration failed to apply.";
        break;
      case "P3019":
        errorMessage =
          "The datasource provider is not supported for the operation.";
        break;
      case "P3020":
        errorMessage =
          "The automatic creation of shadow databases is disabled on Azure SQL.";
        break;
      case "P3021":
        errorMessage = "Foreign keys cannot be created on this database.";
        break;
      case "P3022":
        errorMessage =
          "Direct execution of DDL (Data Definition Language) SQL statements is disabled for this database.";
        break;

      // Prisma Client errors (P4xxx)
      case "P4000":
        errorMessage =
          "Introspection operation failed to produce a schema file.";
        break;
      case "P4001":
        errorMessage = "The introspected database was empty.";
        break;
      case "P4002":
        errorMessage =
          "The schema of the introspected database was inconsistent.";
        break;

      // Engine errors (P5xxx)
      case "P5000":
        errorMessage = "This feature is not implemented yet.";
        break;
      case "P5001":
        errorMessage = "This feature is not supported on the database.";
        break;
      case "P5002":
        errorMessage = "The engine could not connect to the database.";
        break;
      case "P5003":
        errorMessage = "The database does not exist.";
        break;
      case "P5004":
        errorMessage = "The database server timed out at startup.";
        break;
      case "P5005":
        errorMessage = "Authentication failed against database server.";
        break;
      case "P5006":
        errorMessage =
          "We could not determine the version of the database server.";
        break;
      case "P5007":
        errorMessage =
          "The connector is not supported on the given database version.";
        break;
      case "P5008":
        errorMessage =
          "The operations you are trying to perform requires a newer version of the database.";
        break;
      case "P5009":
        errorMessage = "The database server was not reachable.";
        break;
      case "P5010":
        errorMessage = "Access denied to database.";
        break;
      case "P5011":
        errorMessage = "Error opening a TLS connection.";
        break;
      case "P5012":
        errorMessage = "Error querying the database.";
        break;
      case "P5013":
        errorMessage = "The provided database string is invalid.";
        break;
      case "P5014":
        errorMessage = "The kind of database server is not supported.";
        break;
      case "P5015":
        errorMessage =
          "No valid database connection URL found in environment variables.";
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
