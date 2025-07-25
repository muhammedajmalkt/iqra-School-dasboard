"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { feeSchema, type FeeSchema } from "@/lib/formValidationSchemas";

const FeeForm = ({
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
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().split('T')[0];
  };

  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return currentMonth >= 6 ? 
      `${currentYear}-${currentYear + 1}` : 
      `${currentYear - 1}-${currentYear}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FeeSchema>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      studentId: data?.studentId || "",
      feeTypeId: data?.feeTypeId?.toString() || "",
      amount: data?.amount || "",
      dueDate: formatDate(data?.dueDate) || "",
      academicYear: data?.academicYear || getCurrentAcademicYear(),
      semester: data?.semester || "1",
      description: data?.description || "",
      status: data?.status || "pending",
      paidAmount: data?.paidAmount || "",
      paidDate: formatDate(data?.paidDate) || "",
      paymentMethod: data?.paymentMethod || "",
      transactionId: data?.transactionId || "",
      ...(data?.id && { id: data.id }),
    },
  });

  const router = useRouter();
  const watchedStatus = watch("status");
  const { students = [], feeTypes = [] } = relatedData || {};

  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const response = await fetch(
        type === "create" ? "/api/fees" : `/api/fees/${data.id}`,
        {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setOpen(false);
      router.refresh();
      toast.success(`Fee ${type === "create" ? "created" : "updated"} successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">
        {type === "create" ? "Create Fee" : "Update Fee"}
      </h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-gray-400">Fee Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Student *</label>
            <select
              {...register("studentId")}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a student...</option>
              {students.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.surname && `${student.surname}`}
                </option>
              ))}
            </select>
            {errors.studentId?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.studentId.message.toString()}</p>
            )}
          </div>

          {/* Fee Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Fee Type *</label>
            <select
              {...register("feeTypeId")}
              className="w-full p-2 border rounded"
            >
              <option value="">Select fee type...</option>
              {feeTypes.map((feeType: any) => (
                <option key={feeType.id} value={feeType.id.toString()}>
                  {feeType.name}
                  {feeType.defaultAmount && ` - ₹${feeType.defaultAmount.toLocaleString()}`}
                </option>
              ))}
            </select>
            {errors.feeTypeId?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.feeTypeId.message.toString()}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
            <input
              type="number"
              {...register("amount")}
              className="w-full p-2 border rounded"
            />
            {errors.amount?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.amount.message.toString()}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Date *</label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full p-2 border rounded"
            />
            {errors.dueDate?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.dueDate.message.toString()}</p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year *</label>
            <select
              {...register("academicYear")}
              className="w-full p-2 border rounded"
            >
              {getAcademicYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.academicYear?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.academicYear.message.toString()}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium mb-1">Semester *</label>
            <select
              {...register("semester")}
              className="w-full p-2 border rounded"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="annual">Annual</option>
            </select>
            {errors.semester?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.semester.message.toString()}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment Status *</label>
            <select
              {...register("status")}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.status.message.toString()}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-2 border rounded min-h-20"
              placeholder="Optional description or notes..."
            />
            {errors.description?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message.toString()}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Payment Details Section */}
      {(watchedStatus === "paid" || watchedStatus === "partial") && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-gray-400">Payment Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Paid Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Paid Amount (₹) {watchedStatus === "paid" ? "*" : ""}
              </label>
              <input
                type="number"
                {...register("paidAmount")}
                className="w-full p-2 border rounded"
              />
              {errors.paidAmount?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.paidAmount.message.toString()}</p>
              )}
            </div>

            {/* Paid Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Date {watchedStatus === "paid" ? "*" : ""}
              </label>
              <input
                type="date"
                {...register("paidDate")}
                className="w-full p-2 border rounded"
              />
              {errors.paidDate?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.paidDate.message.toString()}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method {watchedStatus === "paid" ? "*" : ""}
              </label>
              <select
                {...register("paymentMethod")}
                className="w-full p-2 border rounded"
              >
                <option value="">Select method...</option>
                <option value="cash">Cash</option>
                <option value="card">Debit/Credit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="cheque">Cheque</option>
                <option value="demand_draft">Demand Draft</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
              {errors.paymentMethod?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentMethod.message.toString()}</p>
              )}
            </div>

            {/* Transaction ID */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
              <input
                {...register("transactionId")}
                className="w-full p-2 border rounded"
              />
              {errors.transactionId?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.transactionId.message.toString()}</p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      {/* Hidden ID field for updates */}
      {data?.id && (
        <input type="hidden" {...register("id")} />
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
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting
            ? type === "create" ? "Creating..." : "Updating..."
            : type === "create" ? "Create Fee" : "Update Fee"}
        </button>
      </div>
    </form>
  );
};

export default FeeForm;