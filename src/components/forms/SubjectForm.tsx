"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SubjectForm = ({
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
  const [formData, setFormData] = useState({
    name: data?.name || "",
    id: data?.id || "",
  });

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    data?.teachers?.map((teacher: any) => teacher.id.toString()) || []
  );
  const [error, setError] = useState("");

  const router = useRouter();
  const { teachers = [] } = relatedData || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeacherChange = (teacherId: string, checked: boolean) => {
    setSelectedTeachers(prev =>
      checked
        ? [...prev, teacherId]
        : prev.filter(id => id !== teacherId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        type === "create" ? "/api/subjects" : `/api/subjects/${data.id}`,
        {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            teachers: selectedTeachers,
          }),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setOpen(false);
      router.refresh();
      toast(`Subject ${type === "create" ? "created" : "updated"} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Subject" : "Update Subject"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Subject Information</legend>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {data?.id && (
            <input type="hidden" name="id" value={formData.id} />
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Teachers</legend>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded scrollbar-hide">
          {teachers.map((teacher: { id: number; name: string; surname: string }) => (
            <label key={teacher.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTeachers.includes(teacher.id.toString())}
                onChange={(e) => handleTeacherChange(teacher.id.toString(), e.target.checked)}
              />
              {teacher.name} {teacher.surname}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-red-500 text-sm">{error}</p>}

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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;