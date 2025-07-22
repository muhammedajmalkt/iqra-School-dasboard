import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type EventList = Event & { class: Class };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  const currentUserId = userId;

  console.log("Auth info:", { userId, role, currentUserId });

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
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
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

  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "-"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  console.log("Query params:", queryParams);
  console.log("Search query:", query);

  // ROLE CONDITIONS - Fixed the role conditions
  let roleQuery: Prisma.EventWhereInput = {};

  if (role && role !== "admin") {
    const roleConditions = {
      teacher: { 
        class: { 
          lessons: { 
            some: { teacherId: currentUserId! } 
          } 
        } 
      },
      student: { 
        class: { 
          students: { 
            some: { id: currentUserId! } 
          } 
        } 
      },
      parent: { 
        class: { 
          students: { 
            some: { parentId: currentUserId! } 
          } 
        } 
      },
    };

    roleQuery = {
      OR: [
        { classId: null }, // Events not associated with any class
        roleConditions[role as keyof typeof roleConditions] || {},
      ],
    };
  }

  // Combine search query with role query
  const finalQuery: Prisma.EventWhereInput = {
    ...query,
    ...roleQuery,
  };

  console.log("Final query:", JSON.stringify(finalQuery, null, 2));

  try {
    const [data, count] = await prisma.$transaction([
      prisma.event.findMany({
        where: finalQuery,
        include: {
          class: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          startTime: 'asc' // Add ordering for better UX
        }
      }),
      prisma.event.count({ where: finalQuery }),
    ]);

    console.log("Fetched data:", data);
    console.log("Total count:", count);
    console.log("Items per page:", ITEM_PER_PAGE);
    console.log("Current page:", p);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Events ({count})</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && <FormContainer table="event" type="create" />}
            </div>
          </div>
        </div>
        {/* LIST */}
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events found. {role !== "admin" && "You may not have access to view events, or there are no events in your classes."}
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
        {/* PAGINATION */}
        {count > 0 && <Pagination page={p} count={count} />}
      </div>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="text-center py-8 text-red-500">
          Error loading events. Please check the console for details.
        </div>
      </div>
    );
  }
};

export default EventListPage;