"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import InputField from "../InputField";
import {
  assignmentSchema,
  type AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    lessons?: {
      id: number;
      name: string;
      subject: { name: string };
      class: { name: string };
    }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  

  const [state, formAction] = useActionState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
      errorMessage: "",
    }
  );

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    const submitData = {
      ...formData,
    };

    startTransition(() => {
      formAction(submitData);
    });
  });

  useEffect(() => {
    if (state.success) {
      toast(
        `Assignment has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  useEffect(() => {
    if (type === "update" && data) {
      setValue("title", data.title);
      setValue("startDate", data.startDate?.toISOString().split("T")[0] || "");
      setValue("dueDate", data.dueDate?.toISOString().split("T")[0] || "");
      setValue("lessonId", data.lessonId);
      if (data.id) {
        setValue("id", data.id);
      }
    }
  }, [data, setValue, type]);

  // Format date for input field (convert Date to YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  };

  console.log("relatedData:", relatedData);
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Assignment Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            <option value="">Select a lesson</option>
            {relatedData?.lessons?.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} - {lesson.subject.name} ({lesson.class.name})
              </option>
            ))}
          </select>
          {errors.lessonId && (
            <p className="text-xs text-red-400">{errors.lessonId.message}</p>
          )}
        </div>
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Schedule Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Start Date"
          name="startDate"
          type="date"
          defaultValue={formatDateForInput(data?.startDate)}
          register={register}
          error={errors?.startDate}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="date"
          defaultValue={formatDateForInput(data?.dueDate)}
          register={register}
          error={errors?.dueDate}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      {state.error && state.errorMessage && (
        <span className="text-red-500">{state.errorMessage}</span>
      )}

      <button
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-400"
        type="submit"
        disabled={isPending}
      >
        {isPending
          ? type === "create"
            ? "Creating..."
            : "Updating..."
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
