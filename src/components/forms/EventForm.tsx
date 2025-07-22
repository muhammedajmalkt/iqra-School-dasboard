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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
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
    if (type === "update" && data) {
      setValue("title", data.title);
      setValue("description", data.description);
      setValue("startTime", data.startTime?.slice(0, 16)); // for datetime-local
      setValue("endTime", data.endTime?.slice(0, 16));
      setValue("classId", data.classId?.toString() || "");
      if (data.id) setValue("id", data.id);
    }
  }, [data, setValue, type]);

  useEffect(() => {
    if (state.success) {
      toast(`Event ${type === "create" ? "created" : "updated"} successfully`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Event" : "Update Event"}
      </h1>

      <InputField
        label="Title"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors.title}
      />
      <InputField
        label="Description"
        name="description"
        defaultValue={data?.description}
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
      <InputField
        label="Class ID"
        name="classId"
        defaultValue={data?.classId || ""}
        register={register}
        error={errors.classId}
      />

      {data && (
        <InputField
          name="id"
          defaultValue={data?.id}
          register={register}
          error={errors?.id}
          hidden
          label=""
        />
      )}

      {state.error && <span className="text-red-500">{state.errorMessage}</span>}

      <button
        className="bg-blue-500 text-white py-2 rounded-md disabled:bg-gray-400"
        type="submit"
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
