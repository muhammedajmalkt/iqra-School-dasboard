import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import AnnouncementBadge from "./forms/AnnouncementBadge";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const Navbar = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const role = (user?.publicMetadata?.role as string) || "";

  let unseenCount = 0;

  if (userId && role) {
    const roleFilter: any[] = [];

    if (role === "admin") {
      // No filter needed, admin sees all
    } else {
      if (["teacher", "student", "parent"].includes(role)) {
        roleFilter.push({ classId: null });

        if (role === "teacher") {
          roleFilter.push({
            class: {
              lessons: {
                some: {
                  teacherId: userId,
                },
              },
            },
          });
        }

        if (role === "student") {
          roleFilter.push({
            class: {
              students: {
                some: {
                  id: userId,
                },
              },
            },
          });
        }

        if (role === "parent") {
          roleFilter.push({
            class: {
              students: {
                some: {
                  parentId: userId,
                },
              },
            },
          });
        }
      }
    }

    unseenCount = await prisma.announcement.count({
      where: {
        ...(role !== "admin" ? { OR: roleFilter } : {}),
        views: {
          none: {
            userId: userId,
          },
        },
      },
    });
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>

        <AnnouncementBadge unseenCount={unseenCount} />

        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.fullName || user?.firstName || "User"}
          </span>
          <span className="text-[10px] text-gray-500 text-right">{role}</span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
