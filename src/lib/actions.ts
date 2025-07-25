"use server";

import prisma from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  EventSchema,
  teacherAttendanceSchema,
  type AnnouncementSchema,
  type AssignmentSchema,
  type AttendanceSchema,
  type ClassSchema,
  type ExamSchema,
  type LessonSchema,
  type ParentSchema,
  type ResultSchema,
  type StudentSchema,
  type SubjectSchema,
  type TeacherSchema,
} from "./formValidationSchemas";
import { createErrorMessage } from "./utils";
import z from "zod";

type CurrentState = { success: boolean; error: boolean; errorMessage?: string };

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
): Promise<CurrentState> => {
  let user;

  try {
    const clerk = await clerkClient();

    // 1. Create Clerk user first
    user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "teacher" },
    });

    // 2. Then create in your own DB
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: Number.parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {    
    // If Prisma failed but Clerk user was created, clean up
    if (user) {
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(user.id);
      } catch (cleanupError) {
        console.error("Failed to rollback Clerk user:", cleanupError);
      }
    }

    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    const clerk = await clerkClient();

    // Update basic user info
    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Update email in Clerk if provided
    if (data.email) {
      try {
        const user = await clerk.users.getUser(data.id);
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        );

        // Only update if email is different
        if (primaryEmail && primaryEmail.emailAddress !== data.email) {
          // Create new email address
          const newEmailAddress = await clerk.emailAddresses.createEmailAddress(
            {
              userId: data.id,
              emailAddress: data.email,
              verified: true,
            }
          );

          // Set as primary email address
          await clerk.users.updateUser(data.id, {
            primaryEmailAddressID: newEmailAddress.id,
          });

          // Delete the old email address (optional)
          if (primaryEmail) {
            await clerk.emailAddresses.deleteEmailAddress(primaryEmail.id);
          }
        }
      } catch (emailError) {
        console.log("Email update error:", emailError);
        // Continue even if email update fails
      }
    }

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: Number.parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(data.get("id"));

    await prisma.subject.delete({ where: { id } });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
): Promise<CurrentState> => {
  let user;

  try {
    const clerk = await clerkClient();

    user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    if (user) {
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(user.id);
      } catch (cleanupError) {
        console.error("Failed to rollback Clerk user:", cleanupError);
      }
    }

    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    const clerk = await clerkClient();

    // Update Clerk user info
    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Email update logic (if provided)
    if (data.email) {
      try {
        const user = await clerk.users.getUser(data.id);
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        );

        if (primaryEmail && primaryEmail.emailAddress !== data.email) {
          const newEmail = await clerk.emailAddresses.createEmailAddress({
            userId: data.id,
            emailAddress: data.email,
            verified: true,
          });

          await clerk.users.updateUser(data.id, {
            primaryEmailAddressID: newEmail.id,
          });

          await clerk.emailAddresses.deleteEmailAddress(primaryEmail.id);
        }
      } catch (emailError) {
        console.log("Email update error:", emailError);
      }
    }

    // Update parent in Prisma
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Parent update error:", err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;

  try {
    const clerk = await clerkClient();

    // Delete from Clerk
    await clerk.users.deleteUser(id);

    // Delete from Prisma
    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    // Revalidate parent list page

    return { success: true, error: false };
  } catch (err) {
    console.error("Parent deletion failed:", err);
    const errorMessage = createErrorMessage(err); // Optional error handler
    return { success: false, error: true, errorMessage };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
): Promise<CurrentState> => {
  let user;
  console.log("create student:", data);
  try {
    const clerk = await clerkClient();

    user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        classId: data.classId,
        gradeId: data.gradeId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    if (user) {
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(user.id);
      } catch (cleanupError) {
        console.error("Failed to rollback Clerk user:", cleanupError);
      }
    }

    const errorMessage = createErrorMessage(err);
    console.log("errorMessage:", errorMessage);
    return { success: false, error: true, errorMessage };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    const clerk = await clerkClient();

    // Update Clerk user
    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Update email in Clerk if provided
    if (data.email) {
      try {
        const user = await clerk.users.getUser(data.id);
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        );

        if (primaryEmail && primaryEmail.emailAddress !== data.email) {
          const newEmailAddress = await clerk.emailAddresses.createEmailAddress(
            {
              userId: data.id,
              emailAddress: data.email,
              verified: true,
            }
          );

          await clerk.users.updateUser(data.id, {
            primaryEmailAddressID: newEmailAddress.id,
          });

          await clerk.emailAddresses.deleteEmailAddress(primaryEmail.id);
        }
      } catch (emailError) {
        console.log("Email update error:", emailError);
      }
    }

    // Update in Prisma DB
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        parentId: data.parentId,
        classId: Number(data.classId),
        gradeId: Number(data.gradeId),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Student update failed:", err);
    const errorMessage = createErrorMessage(err); // Optional
    return { success: false, error: true, errorMessage };
  }
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
): Promise<CurrentState> => {
  try {
    console.log("data:", data);
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId: string) => ({
            id: teacherId,
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create subject error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Subject ID is required for update",
    };
  }

  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: [], // Clear existing connections
          connect: data.teachers?.map((teacherId: string) => ({
            id: teacherId,
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update subject error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  try {
    console.log("data:", data);
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId || null,
        gradeId: data.gradeId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create class error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Class ID is required for update",
    };
  }

  try {
    console.log("update data:", data);
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId || null,
        gradeId: data.gradeId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update class error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(data.get("id"));

    await prisma.class.delete({ where: { id } });
    return { success: true, error: false };
  } catch (error) {
    const errorMessage = createErrorMessage(error);
    return { success: false, error: true, errorMessage };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
): Promise<CurrentState> => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create exam error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Exam ID is required for update",
    };
  }

  try {
    console.log("update data:", data);
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update exam error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(data.get("id"));

    await prisma.exam.delete({ where: { id } });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    const errorMessage = createErrorMessage(error);
    return { success: false, error: true, errorMessage };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
): Promise<CurrentState> => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create lesson error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Lesson ID is required for update",
    };
  }

  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update lesson error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(formData.get("id"));
    await prisma.lesson.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete lesson error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
): Promise<CurrentState> => {
  try {
    const { userId } = await auth();

    const result = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });
    try {
      await markAnnouncementAsViewed(userId!, result.id);
    } catch (error) {
      throw error;
    }
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Announcement ID is required",
    };
  }

  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;

  if (!id) {
    return {
      success: false,
      error: true,
      errorMessage: "Announcement ID is required",
    };
  }

  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
): Promise<CurrentState> => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create assignment error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Assignment ID is required for update",
    };
  }

  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update assignment error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(formData.get("id"));
    await prisma.assignment.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete assignment error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
): Promise<CurrentState> => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create result error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Result ID is required for update",
    };
  }

  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update result error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(formData.get("id"));
    await prisma.result.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete result error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
): Promise<CurrentState> => {
  try {
    console.log("create atten:", data);
    await prisma.attendance.create({
      data: {
        date: new Date(data.date),
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create attendance error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      errorMessage: "Attendance ID is required for update",
    };
  }

  console.log("update atten:", data);
  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        date: new Date(data.date),
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update attendance error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  try {
    const id = Number(formData.get("id"));
    await prisma.attendance.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete attendance error:", err);
    const errorMessage = createErrorMessage(err);
    return { success: false, error: true, errorMessage };
  }
};

export const createAttendances = async (
  currentState: CurrentState,
  data: {
    date: string;
    lessonId: number;
    attendances: { studentId: string; present: boolean }[];
  }
): Promise<CurrentState> => {
  try {
    const parsedData = teacherAttendanceSchema.parse(data);

    await prisma.$transaction(
      parsedData.attendances.map((attendance) =>
        prisma.attendance.create({
          data: {
            date: new Date(parsedData.date),
            present: attendance.present,
            studentId: attendance.studentId,
            lessonId: parsedData.lessonId,
          },
        })
      )
    );

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create attendances error:", err);
    const errorMessage =
      err instanceof z.ZodError
        ? err.errors.map((e) => e.message).join(", ")
        : "An error occurred while recording attendances";
    return { success: false, error: true, errorMessage };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
): Promise<CurrentState> => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create event error:", err);
    return {
      success: false,
      error: true,
      errorMessage: createErrorMessage(err),
    };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { success: false, error: true, errorMessage: "Missing event ID" };
  }

  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update event error:", err);
    return {
      success: false,
      error: true,
      errorMessage: createErrorMessage(err),
    };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = Number(data.get("id"));
  try {
    await prisma.event.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err: any) {
    return {
      success: false,
      error: true,
      errorMessage: createErrorMessage(err),
    };
  }
};

export async function markAnnouncementAsViewed(
  userId: string,
  announcementId: number
): Promise<void> {
  await prisma.announcementView.upsert({
    where: {
      userId_announcementId: {
        userId,
        announcementId,
      },
    },
    create: {
      userId,
      announcementId,
    },
    update: {
      viewedAt: new Date(),
    },
  });
}

export async function markMultipleAnnouncementsAsViewed(
  userId: string,
  announcementIds: number[]
): Promise<void> {
  // Use createMany with skipDuplicates to handle bulk insertion
  await prisma.announcementView.createMany({
    data: announcementIds.map((announcementId) => ({
      userId,
      announcementId,
    })),
    skipDuplicates: true,
  });
}
