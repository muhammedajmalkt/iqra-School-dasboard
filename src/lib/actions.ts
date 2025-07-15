"use server"

import { revalidatePath } from "next/cache"
import prisma from "./prisma"
import { clerkClient } from "@clerk/nextjs/server"
import type { TeacherSchema } from "./formValidationSchemas"

type CurrentState = { success: boolean; error: boolean }

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email || ""],
      publicMetadata: { role: "teacher" },
    })

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
    })

    revalidatePath("/list/teachers")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  if (!data.id) {
    return { success: false, error: true }
  }

  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email || ""],
    })

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
    })

    revalidatePath("/list/teachers")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string
  try {
    await clerkClient.users.deleteUser(id)

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    })

    revalidatePath("/list/teachers")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}
