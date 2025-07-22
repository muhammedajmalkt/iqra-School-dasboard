"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { resultSchema, type ResultSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
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
    watch,
    setValue,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      id: data?.id ?? undefined,
      score: data?.score ?? undefined,
      examId: data?.examId ?? undefined,
      assignmentId: data?.assignmentId ?? undefined,
      studentId: data?.studentId ?? "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
      errorMessage: "",
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students = [], exams = [], assignments = [] } = relatedData || {};

  const examId = watch("examId");
  const assignmentId = watch("assignmentId");

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue("examId", value ? Number(value) : undefined);
    if (value) {
      setValue("assignmentId", undefined);
    }
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setValue("assignmentId", value ? Number(value) : undefined);
    if (value) {
      setValue("examId", undefined);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Result Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId || ""}
          >
            <option value="">Select Student</option>
            {students?.map((student: { id: string; name: string }) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Score"
          name="score"
          type="number"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Exam</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={examId || ""}
            onChange={handleExamChange}
          >
            <option value="">Select Exam</option>
            {exams?.map((exam: { id: number; title: string }) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {errors.examId?.message && (
            <p className="text-xs text-red-400">
              {errors.examId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Assignment</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={assignmentId || ""}
            onChange={handleAssignmentChange}
          >
            <option value="">Select Assignment</option>
            {assignments?.map((assignment: { id: number; title: string }) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {errors.assignmentId?.message && (
            <p className="text-xs text-red-400">
              {errors.assignmentId.message.toString()}
            </p>
          )}
        </div>

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

      <button className="bg-blue-400 text-white p-2 rounded-md" type="submit">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
