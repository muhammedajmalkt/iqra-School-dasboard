import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";
config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function createAdminUser() {
  try {
    const existingUsers = await clerk.users.getUserList({
      username: ["anfaskaloor"],
    });

    if (existingUsers.data.length > 0) {
      await clerk.users.deleteUser(existingUsers.data[0].id);
      console.log("Existing user deleted");
    }

    const user = await clerk.users.createUser({
      username: "anfaskaloor",
      password: "SecureAdmin123!",
      publicMetadata: { role: "admin" },
    });
    console.log("Admin user created:", user.id);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

async function main() {
  await createAdminUser();

  // ADMIN
  await prisma.admin.create({
    data: {
      id: "1",
      username: "anfaskaloor",
    },
  });

  // GRADE
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({
      data: {
        level: i,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("seed has error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
