"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TeacherForm = ({
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
    username: data?.username || "",
    email: data?.email || "",
    password: "",
    name: data?.name || "",
    surname: data?.surname || "",
    phone: data?.phone || "",
    address: data?.address || "",
    bloodType: data?.bloodType || "",
    sex: data?.sex || "",
    birthday: data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "",
    id: data?.id || "",
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data?.subjects?.map((subject: any) => subject.id.toString()) || []
  );
  const [image, setImage] = useState(data?.img || "");
  const [error, setError] = useState("");

  const router = useRouter();
  const { subjects = [] } = relatedData || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setSelectedSubjects(prev =>
      checked
        ? [...prev, subjectId]
        : prev.filter(id => id !== subjectId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      setError("At least one subject is required");
      return;
    }

    try {
      const response = await fetch(
        type === "create" ? "/api/teachers" : `/api/teachers/${data.id}`,
        {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            img: image,
            subjects: selectedSubjects,
          }),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setOpen(false);
      router.refresh();
      alert(`Teacher ${type === "create" ? "created" : "updated"} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 space-y-6  h-[70vh] overflow-scroll scrollbar-hide">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Teacher" : "Update Teacher"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Authentication</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {type === "create" && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={type === "create"}
              />
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blood Type</label>
            <input
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          {data?.id && (
            <input type="hidden" name="id" value={formData.id} />
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Subjects</legend>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
          {subjects.map((subject: { id: number; name: string }) => (
            <label key={subject.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.id.toString())}
                onChange={(e) => handleSubjectChange(subject.id.toString(), e.target.checked)}
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
        <legend className="text-sm font-medium text-gray-500">Photo</legend>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {image ? (
              <img src={image} alt="Teacher" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[8px]">
                No photo
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              // Implement your image upload logic here
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  // In a real app, you would upload the file here
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImage(event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Upload Photo
          </button>
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