import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { markMultipleAnnouncementsAsViewed } from "@/lib/actions";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type AnnouncementList = Announcement & {
  class: Class;
  views: { userId: string }[];
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  // Await the searchParams Promise
  const resolvedSearchParams = await searchParams;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: AnnouncementList) => {
    const isViewed = item.views.some((view) => view.userId === currentUserId);

    return (
      <tr
        key={item.id}
        className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight ${
          !isViewed ? "bg-blue-50" : ""
        }`}
      >
        <td className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            {!isViewed && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {item.title}
          </div>
        </td>
        <td>{item.class?.name || "-"}</td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US").format(item.date)}
        </td>
        <td className="hidden lg:table-cell">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isViewed
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isViewed ? "Read" : "Unread"}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="announcement" type="update" data={item} />
                <FormContainer
                  table="announcement"
                  type="delete"
                  id={item.id}
                />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, markViewed, ...queryParams } = resolvedSearchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AnnouncementWhereInput = {};

  // Search condition
  if (queryParams?.search) {
    query.title = {
      contains: queryParams.search,
      mode: "insensitive",
    };
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      // Admin can see all announcements - no additional filtering needed
      break;
    case "teacher":
      query.OR = [
        { classId: null }, // General announcements
        {
          class: {
            lessons: { some: { teacherId: currentUserId! } },
          },
        },
      ];
      break;
    case "student":
      query.OR = [
        { classId: null }, // General announcements
        {
          class: {
            students: { some: { id: currentUserId! } },
          },
        },
      ];
      break;
    case "parent":
      query.OR = [
        { classId: null }, // General announcements
        {
          class: {
            students: { some: { parentId: currentUserId! } },
          },
        },
      ];
      break;
    default:
      break;
  }

  // Handle sorting
  const currentSort = queryParams.sort || "created_desc";
  const orderBy: Prisma.AnnouncementOrderByWithRelationInput = (() => {
    switch (currentSort) {
      case "name_asc":
        return { title: "asc" };
      case "name_desc":
        return { title: "desc" };
      default:
        return { title: "asc" };
    }
  })();

  // First fetch to get announcements that need to be marked as viewed
  if (currentUserId && !markViewed) {
    const unviewedAnnouncements = await prisma.announcement.findMany({
      where: {
        ...query,
        views: {
          none: {
            userId: currentUserId,
          },
        },
      },
      select: {
        id: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    });

    if (unviewedAnnouncements.length > 0) {
      const announcementIds = unviewedAnnouncements.map((announcement) => announcement.id);
      await markMultipleAnnouncementsAsViewed(currentUserId, announcementIds);
      
      // Redirect to mark as viewed to prevent the stale state
      const params = new URLSearchParams(resolvedSearchParams as Record<string, string>);
      params.set('markViewed', 'true');
      redirect(`/list/announcements?${params.toString()}`);
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      orderBy,
      include: {
        class: true,
        views: {
          where: {
            userId: currentUserId!,
          },
          select: {
            userId: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  const getQueryString = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== 'markViewed') query.set(key, value);
    }
    return query.toString();
  };

  const sortOptions = [
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* SORT BUTTON */}
            <div className="relative group">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-400 transition-colors">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <Link
                      key={option.value}
                      href={`/list/announcement?${getQueryString({
                        ...queryParams,
                        sort: option.value,
                      })}`}
                      className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                        currentSort === option.value
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* FILTER Placeholder (Optional) */}
            <div className="relative group">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-400 transition-colors">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <div className="absolute right-0 top-10 bg-white text-sm text-gray-500 border border-gray-200 rounded-md shadow-lg z-10 p-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <p className="text-xs px-2 py-1">No filters yet</p>
              </div>
            </div>

            {role === "admin" && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;