"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { teacherSchema, type TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
    setValue,
    watch,
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data?.subjects?.map((subject: any) => subject.id.toString()) || []
  );

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
      errorMessage: "",
    }
  );

  const onSubmit = handleSubmit((formData) => {
    const submitData = {
      ...formData,
      img: img?.secure_url,
      subjects: selectedSubjects,
    };
    formAction(submitData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Set default values for update
  useEffect(() => {
    if (type === "update" && data) {
      setValue("username", data.username);
      setValue("name", data.name);
      setValue("surname", data.surname);
      setValue("email", data.email);
      setValue("phone", data.phone);
      setValue("address", data.address);
      setValue("bloodType", data.bloodType);
      setValue("sex", data.sex);
      if (data.birthday) {
        setValue("birthday", new Date(data.birthday));
      }
      if (data.id) {
        setValue("id", data.id);
      }
    }
  }, [data, setValue, type]);

  const { subjects } = relatedData || { subjects: [] };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-4 space-y-6 h-[70vh] overflow-scroll scrollbar-hide">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Teacher" : "Update Teacher"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Authentication</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              {...register("username")}
              defaultValue={data?.username}
              className="w-full p-2 border rounded"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              defaultValue={data?.email}
              className="w-full p-2 border rounded"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          {type === "create" && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full p-2 border rounded"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Personal Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              {...register("name")}
              defaultValue={data?.name}
              className="w-full p-2 border rounded"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              {...register("surname")}
              defaultValue={data?.surname}
              className="w-full p-2 border rounded"
            />
            {errors.surname && (
              <p className="text-xs text-red-500 mt-1">{errors.surname.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              {...register("phone")}
              defaultValue={data?.phone}
              className="w-full p-2 border rounded"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              {...register("address")}
              defaultValue={data?.address}
              className="w-full p-2 border rounded"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blood Type</label>
            <input
              {...register("bloodType")}
              defaultValue={data?.bloodType}
              className="w-full p-2 border rounded"
            />
            {errors.bloodType && (
              <p className="text-xs text-red-500 mt-1">{errors.bloodType.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birthday</label>
            <input
              type="date"
              {...register("birthday")}
              defaultValue={
                data?.birthday
                  ? new Date(data.birthday).toISOString().split("T")[0]
                  : ""
              }
              className="w-full p-2 border rounded"
            />
            {errors.birthday && (
              <p className="text-xs text-red-500 mt-1">{errors.birthday.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sex</label>
            <select
              {...register("sex")}
              defaultValue={data?.sex}
              className="w-full p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.sex && (
              <p className="text-xs text-red-500 mt-1">{errors.sex.message}</p>
            )}
          </div>
          {data?.id && (
            <input type="hidden" {...register("id")} defaultValue={data?.id} />
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Subjects</legend>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
          {subjects.map((subject: { id: number; name: string }) => (
            <label key={subject.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.id.toString())}
                onChange={(e) =>
                  handleSubjectChange(subject.id.toString(), e.target.checked)
                }
                className="w-4 h-4"
              />
              {subject.name}
            </label>
          ))}
        </div>
        {selectedSubjects.length === 0 && (
          <p className="text-sm text-red-500">Please select at least one subject</p>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Photo</legend>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {img?.secure_url || data?.img ? (
              <Image
                src={img?.secure_url || data?.img}
                alt="Teacher"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[8px]">
                No photo
              </div>
            )}
          </div>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <button
                  type="button"
                  onClick={() => open()}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  Upload Photo
                </button>
              );
            }}
          </CldUploadWidget>
        </div>
      </fieldset>

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
          disabled={selectedSubjects.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;