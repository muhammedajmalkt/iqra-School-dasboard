import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { currentUser } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  const currentUserId = user?.id;
  
  if (type !== "delete") {
    switch (table) {
      case "subject": {
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      }

      case "class": {
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      }

      case "teacher": {
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      }

      case "student": {
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const parents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
          parents: parents,
        };
        break;
      }

      case "exam": {
        const examLessons = await prisma.lesson.findMany({
          where: role === "teacher" ? { teacherId: currentUserId! } : {},
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      }

      case "lesson": {
        const subjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });

        const teachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = {
          subjects,
          classes,
          teachers:
            role === "teacher"
              ? teachers.filter((t) => t.id === currentUserId)
              : teachers,
        };
        break;
      }

      case "assignment": {
        const assignmentLessons = await prisma.lesson.findMany({
          where: role === "teacher" ? { teacherId: currentUserId! } : {},
          select: {
            id: true,
            name: true,
            subject: {
              select: { name: true },
            },
            class: {
              select: { name: true },
            },
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      }

      case "result": {
        // Fetch students - filter by teacher's classes if role is teacher
        const students = await prisma.student.findMany({
          where: role === "teacher" 
            ? {
                class: {
                  lessons: {
                    some: {
                      teacherId: currentUserId!
                    }
                  }
                }
              }
            : {},
          select: { 
            id: true, 
            name: true, 
            surname: true,
            class: {
              select: { name: true }
            }
          },
        });

        // Format students with full name and class info
        const formattedStudents = students.map(student => ({
          id: student.id,
          name: `${student.name} ${student.surname}${student.class ? ` (${student.class.name})` : ''}`
        }));

        // Fetch exams - filter by teacher if role is teacher
        const exams = await prisma.exam.findMany({
          where: role === "teacher" 
            ? {
                lesson: {
                  teacherId: currentUserId!
                }
              }
            : {},
          select: { 
            id: true, 
            title: true,
            lesson: {
              select: { 
                name: true,
                subject: {
                  select: { name: true }
                }
              }
            }
          },
        });

        // Format exams with lesson and subject info
        const formattedExams = exams.map(exam => ({
          id: exam.id,
          title: `${exam.title} (${exam.lesson.subject.name} - ${exam.lesson.name})`
        }));

        // Fetch assignments - filter by teacher if role is teacher
        const assignments = await prisma.assignment.findMany({
          where: role === "teacher" 
            ? {
                lesson: {
                  teacherId: currentUserId!
                }
              }
            : {},
          select: { 
            id: true, 
            title: true,
            lesson: {
              select: { 
                name: true,
                subject: {
                  select: { name: true }
                }
              }
            }
          },
        });

        // Format assignments with lesson and subject info
        const formattedAssignments = assignments.map(assignment => ({
          id: assignment.id,
          title: `${assignment.title} (${assignment.lesson.subject.name} - ${assignment.lesson.name})`
        }));

        relatedData = { 
          students: formattedStudents,
          exams: formattedExams,
          assignments: formattedAssignments
        };
        break;
      }

      case "announcement": {
        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });

        relatedData = {
          classes,
        };
        break;
      }

      default:
        break;
    }
  }

  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;