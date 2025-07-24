"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { attendanceSchema, type AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id || "",
      date: data?.date ? new Date(data.date).toISOString().split("T")[0] : "",
      present: data?.present || false,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
      errorMessage: "",
    }
  );

  const router = useRouter();
  const { students = [], lessons = [] } = relatedData || {};

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Attendance" : "Update Attendance"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Attendance Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full p-2 border rounded"
              required
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Controller
              name="present"
              control={control}
              render={({ field }) => (
                <select
                  className="w-full p-2 border rounded"
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                >
                  <option value="true">Present</option>
                  <option value="false">Absent</option>
                </select>
              )}
            />
            {errors.present && (
              <p className="text-xs text-red-500 mt-1">{errors.present.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Related Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>
            <select
              {...register("studentId")}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Student</option>
              {students?.map((student: { id: string; name: string }) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-xs text-red-500 mt-1">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lesson</label>
            <select
              {...register("lessonId")}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Lesson</option>
              {lessons?.map((lesson: { id: number; title: string }) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
            {errors.lessonId && (
              <p className="text-xs text-red-500 mt-1">{errors.lessonId.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {data?.id && (
        <input type="hidden" {...register("id")} />
      )}

      {state.error && state.errorMessage && (
        <p className="text-red-500 text-sm">{state.errorMessage}</p>
      )}

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

export default AttendanceForm;