"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import type {
  ParentSchema,
  StudentSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import { createErrorMessage } from "./utils";

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

    revalidatePath("/list/teachers");
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

    revalidatePath("/list/teachers");
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

    revalidatePath("/list/teachers");
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

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
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
    console.log(error);
    return { success: false, error: true };
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

    revalidatePath("/list/parents");
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

    revalidatePath("/list/parents");
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
    revalidatePath("/list/parents");

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

    revalidatePath("/list/students");
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

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Student update failed:", err);
    const errorMessage = createErrorMessage(err); // Optional
    return { success: false, error: true, errorMessage };
  }
};
