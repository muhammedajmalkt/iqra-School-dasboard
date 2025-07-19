"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { useFormState } from "react-dom";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteSubject,
  lesson: deleteSubject,
  assignment: deleteSubject,
  result: deleteSubject,
  attendance: deleteSubject,
  event: deleteSubject,
  announcement: deleteSubject,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const Form = () => {
    const [isPending] = useTransition();
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state.success, table, router]);

    useEffect(() => {
      if (state.error) {
        if (state.errorMessage) {
          toast.error(state.errorMessage);
        }
      }
    }, [state.errorMessage]);

    if (type === "delete" && id) {
      return (
        <form action={formAction} className="p-4 flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button
            type="submit"
            className="bg-red-700 text-white py-2 px-4 rounded-md self-center"
          >
            {isPending ? "Loading..." : "Delete"}
          </button>
        </form>
      );
    }

    if (type === "create" || type === "update") {
      const FormComponent = forms[table];
      return FormComponent ? (
        FormComponent(setOpen, type, data, relatedData)
      ) : (
        <p>Form not found!</p>
      );
    }

    return <p>Invalid form type!</p>;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-90 transition`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt={type} width={16} height={16} />
      </button>

      {open && (
        <div className="w-full fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center overflow-y-scroll">
          <div
            ref={modalRef}
            className="relative bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-2xl animate-fadeIn"
          >
            <Form />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 hover:rotate-90 transition-transform"
              aria-label="Close"
            >
              <Image src="/close.png" alt="Close" width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
