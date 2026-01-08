"use client";

import { PropsWithChildren } from "react";
import { Field } from "@/types/api";
import { useTranslations } from "next-intl";
import { StatusBadge } from "../StatusBadge";

interface FieldCardProps extends PropsWithChildren {
  field: Field;
  selectedDate?: string;
  updating?: boolean;
  onBook: (fieldId: string, startTime: string, endTime: string) => void;
}

export default function FieldCard({
  field,
  selectedDate,
  updating = false,
  onBook,
  ...props
}: FieldCardProps) {
  const t = useTranslations("fields");
  const playerCount = field.capacity ?? 0;

  const handleBook = () => {
    if (selectedDate && field.isAvailable) {
      const startTime = `${selectedDate}T18:00`;
      const endTime = `${selectedDate}T20:00`;
      onBook(field.id, startTime, endTime);
    }
  };

  return (
    <div
      {...props}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md p-8 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-4">
            {field.name}
          </h3>
        </div>

        <StatusBadge
          status={field.isAvailable ? "available" : "booked"}
          size="lg"
        />
      </div>

      {/* Stats Grid */}
      <div className="flex flex-row flex-wrap gap-4">
        {/* Neutral Sport Badge */}
        <div className="inline-flex items-center px-4 bg-gray-100 text-gray-800 text-sm font-bold rounded-xl shadow-sm border border-gray-200">
          {field.sport.toUpperCase()}
        </div>

        {/* Players */}
        <div className="flex items-center gap-3 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
          <span className="w-5 h-5 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm text-lg">
            👥
          </span>
          <div>
            <div className="text-xl font-bold text-gray-900">{playerCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t("players")}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className=" flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
          <span className="w-5 h-5 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm text-lg">
            📍
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm line-clamp-2">
              {field.address}
            </div>
          </div>
        </div>
      </div>

      {/* Price - Hero Section */}
      <div className="py-4 border-t border-gray-100">
        <div className="flex items-start gap-2 text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
          <span className="text-2xl relative -top-0.5">
            ${field.pricePerHour}
          </span>
          <span className="text-lg font-semibold text-gray-500">
            /{t("perHour").toLowerCase()}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      {field.isAvailable && (
        <button
          onClick={handleBook}
          disabled={updating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl border border-transparent focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
        >
          {updating ? `${t("booking")}…` : t("bookNow")}
        </button>
      )}
    </div>
  );
}
