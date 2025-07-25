"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type Dispatch, type SetStateAction } from "react";
import {
  announcementSchema,
  type AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id ?? undefined,
      title: data?.title ?? "",
      description: data?.description ?? "",
      classId: data?.classId ?? undefined,
      date: data?.date ? new Date(data.date).toISOString().slice(0, 16) : "",
    },
  });

  const router = useRouter();
  const { classes = [] } = relatedData || {};

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const response = await fetch(
        type === "create" ? "/api/announcements" : `/api/announcements/${data.id}`,
        {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setOpen(false);
      router.refresh();
      toast.success(
        `Announcement ${type === "create" ? "created" : "updated"} successfully!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Announcement Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded"
              required
            />
            {errors.title?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message.toString()}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="datetime-local"
              {...register("date")}
              className="w-full p-2 border rounded"
              required
            />
            {errors.date?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.date.message.toString()}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-2 border rounded min-h-32"
              required
            />
            {errors.description?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message.toString()}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Class (Optional)</label>
            <select
              {...register("classId")}
              className="w-full p-2 border rounded"
            >
              <option value="">All Classes</option>
              {classes.map((classItem: { id: number; name: string }) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.classId?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.classId.message.toString()}</p>
            )}
          </div>

          {data?.id && (
            <input type="hidden" {...register("id")} />
          )}
        </div>
      </fieldset>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;