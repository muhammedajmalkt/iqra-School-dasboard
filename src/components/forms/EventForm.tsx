"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useTransition } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import { eventSchema, type EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Helper function to format DateTime to datetime-local input format
  const formatDateTimeLocal = (date: Date | string) => {
    if (!date) return "";
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return "";
    
    // Format as YYYY-MM-DDTHH:mm (datetime-local format)
    return dateObj.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      startTime: formatDateTimeLocal(data?.startTime),
      endTime: formatDateTimeLocal(data?.endTime),
      classId: data?.classId?.toString() || "",
      ...(data?.id && { id: data.id }),
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false, errorMessage: "" }
  );

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction(formData);
    });
  });

  useEffect(() => {
    if (state.success) {
      toast(`Event ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { classes } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>
      
      <span className="text-xs text-gray-400 font-medium">
        Event Information
      </span>
      
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors.title}
        />
        <InputField
          label="Description"
          name="description"
          register={register}
          error={errors.description}
        />
        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />
        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">Choose a class...</option>
            {classes?.map((cls: any) => (
              <option key={cls.id} value={cls.id.toString()}>
                {cls.name} - {cls.grade} {cls.section ? `(${cls.section})` : ''}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {data?.id && (
          <InputField
            label="Id"
            name="id"
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
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-400"
        disabled={isPending}
      >
        {isPending
          ? type === "create" ? "Creating..." : "Updating..."
          : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm;