"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import InputField from "../InputField";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { createAttendances } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  teacherAttendanceSchema,
  TeacherAttendanceSchema,
} from "@/lib/formValidationSchemas";

const TeacherAttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students: { id: string; name: string }[];
    lessons: { id: number; title: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeacherAttendanceSchema>({
    resolver: zodResolver(teacherAttendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      lessonId: undefined,
      attendances:
        relatedData?.students.map((student) => ({
          studentId: student.id,
          present: false,
        })) || [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "attendances",
  });

  const [state, formAction] = useFormState(createAttendances, {
    success: false,
    error: false,
    errorMessage: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast("Attendances have been recorded!");
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen]);

  const { students = [], lessons = [] } = relatedData || {};

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Record Attendance for Students</h1>

      <span className="text-xs text-gray-400 font-medium">
        Attendance Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          register={register}
          error={errors?.date}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
          >
            <option value="">Select Lesson</option>
            {lessons.map((lesson: { id: number; title: string }) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-72 overflow-y-scroll scrollbar-hide">
        <span className="text-xs text-gray-400 font-medium">Students</span>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((field, index) => {
                const student = students.find((s) => s.id === field.studentId);
                return (
                  <tr key={field.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Controller
                        name={`attendances.${index}.present`}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}
                      />
                      <input
                        type="hidden"
                        {...register(`attendances.${index}.studentId`)}
                        value={field.studentId}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.attendances?.message && (
          <p className="text-xs text-red-400">{errors.attendances.message}</p>
        )}
      </div>

      {state.error && state.errorMessage && (
        <span className="text-red-500">{state.errorMessage}</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md" type="submit">
        Record Attendances
      </button>
    </form>
  );
};

export default TeacherAttendanceForm;
