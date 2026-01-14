"use client";

import { PropsWithChildren, useState } from "react";
import { Field, Slot, SlotStatus } from "@/types/api";
import { useTranslations } from "next-intl";
import { StatusBadge } from "../StatusBadge";
import { FIXED_SLOTS } from "@/enums/enums";
import { useAuth } from "@/hooks/useAuth";

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
}: FieldCardProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const t = useTranslations("fields");
  const playerCount = field.capacity ?? 0;
  const [currentSlot, setCurrentSlot] = useState<{
    start: string;
    end: string;
  }>({ start: "", end: "" });

  const slots: Slot[] = (() => {
    if (!selectedDate) return [];

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const isToday = selectedDate === today;

    const todayBookings = field.bookings.filter(
      (b) => b.isActive && b.date === selectedDate
    );

    return FIXED_SLOTS.map((slotTime) => {
      const slotHour = parseInt(slotTime.split(":")[0], 10);

      const isPastSlot =
        isToday &&
        (slotHour < now.getHours() ||
          (slotHour === now.getHours() && now.getMinutes() >= 0));

      const anyBooking = todayBookings.find((booking) => {
        const bookStartHour = parseInt(booking.startTime.split(":")[0], 10);
        const bookEndHour = parseInt(booking.endTime.split(":")[0], 10);
        return slotHour >= bookStartHour && slotHour < bookEndHour;
      });

      if (!anyBooking) {
        return {
          time: slotTime,
          available: !isPastSlot,
          status: isPastSlot ? SlotStatus.PAST : SlotStatus.AVAILABLE,
          bookerName: undefined,
        } as Slot;
      }

      const isMyBooking = anyBooking.user?.id === currentUserId;

      return {
        time: slotTime,
        available: false,
        status: isMyBooking ? SlotStatus.MYBOOKING : SlotStatus.BOOKED,
        bookerName: anyBooking.user?.name,
      } as Slot;
    });
  })();

  const availableSlots = slots.filter((s) => s.available);
  const isAvailable = availableSlots.length > 0;
  const hours = 1;
  const totalPrice = (field.pricePerHour || 25) * hours;

  const updateSelectedSlot = (time: string) => {
    if (currentSlot.start === time) {
      setCurrentSlot({ start: "", end: "" });
      return;
    }

    const startHour = parseInt(time.split(":")[0], 10);
    const nextHour = startHour + 1;
    const endTime = `${String(nextHour).padStart(2, "0")}:00`;

    setCurrentSlot({ start: time, end: endTime });
  };

  const isValidBookingRange = () => {
    if (!currentSlot.start || !currentSlot.end) return false;

    const startHour = parseInt(currentSlot.start.split(":")[0], 10);
    const endHour = parseInt(currentSlot.end.split(":")[0], 10);

    const todayBookings = field.bookings.filter(
      (b) => b.isActive && b.date === selectedDate
    );

    for (const booking of todayBookings) {
      const bookStart = parseInt(booking.startTime.split(":")[0], 10);
      const bookEnd = parseInt(booking.endTime.split(":")[0], 10);

      if (startHour < bookEnd && endHour > bookStart) {
        return false;
      }
    }
    return true;
  };

  const handleBook = () => {
    if (
      selectedDate &&
      currentSlot.start &&
      currentSlot.end &&
      isAvailable &&
      isValidBookingRange()
    ) {
      onBook(
        field.id,
        `${selectedDate}T${currentSlot.start}`,
        `${selectedDate}T${currentSlot.end}`
      );
    }
  };

  const isSelected = (time: string) => currentSlot.start === time;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md p-8 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-4">
            {field.name}
          </h3>
        </div>
        <StatusBadge status={isAvailable ? "available" : "booked"} size="lg" />
      </div>

      {/* Stats */}
      <div className="flex flex-row flex-wrap gap-4">
        <div className="inline-flex items-center px-4 bg-gray-100 text-gray-800 text-sm font-bold rounded-xl shadow-sm border border-gray-200">
          {field.sport?.toUpperCase()}
        </div>
        <div className="flex items-center gap-3 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
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
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors flex-1 min-w-[200px]">
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

      {/* Slots Grid */}
      {selectedDate ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              {t("slotRange", { defaultMessage: "Slots" })} (1h each)
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                availableSlots.length === FIXED_SLOTS.length
                  ? "bg-emerald-100 text-emerald-800"
                  : availableSlots.length > FIXED_SLOTS.length / 2
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {availableSlots.length}/{FIXED_SLOTS.length} {t("free")}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border-2 border-dashed border-gray-200">
            {slots.map((slot) => {
              const selected = isSelected(slot.time);

              return (
                <button
                  key={slot.time}
                  onClick={() => updateSelectedSlot(slot.time)}
                  disabled={!slot.available}
                  className={`
                    group relative p-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-xl border-4 overflow-hidden min-h-[64px]
                    flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-[1.05] active:scale-95
                    ${
                      selected
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-100/95 via-emerald-50 to-emerald-100 shadow-emerald-400/50 ring-2 ring-emerald-200/50"
                        : slot.status === SlotStatus.MYBOOKING
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-100/95 via-indigo-50 to-indigo-100 shadow-indigo-400/50 ring-2 ring-indigo-200/50 cursor-default"
                        : slot.status === SlotStatus.PAST
                        ? "border-gray-400/40 bg-gradient-to-br from-gray-100/70 to-gray-200/70 shadow-gray-200/40 cursor-not-allowed opacity-65 hover:opacity-65"
                        : slot.status === SlotStatus.BOOKED
                        ? "border-red-400/40 bg-gradient-to-br from-red-50/80 to-red-100/80 shadow-red-200/40 cursor-not-allowed opacity-80 hover:opacity-80"
                        : "border-transparent bg-white/85 hover:bg-gradient-to-br hover:from-emerald-50/85 hover:to-indigo-50/85 hover:border-emerald-300/50 hover:shadow-emerald-150/50 shadow-sm hover:shadow-lg hover:-translate-y-px"
                    }
                  `}
                  title={
                    selected
                      ? `${currentSlot.start}-${currentSlot.end} (1h selected)`
                      : slot.status === SlotStatus.MYBOOKING
                      ? `Your booking by ${slot.bookerName} (${slot.time}-${
                          parseInt(slot.time.split(":")[0]) + 1
                        }:00)`
                      : slot.status === SlotStatus.PAST
                      ? t("pastTime")
                      : slot.status === SlotStatus.BOOKED
                      ? t("slotBooked")
                      : t("clickFor1h")
                  }
                >
                  <div className="flex flex-col items-center gap-px relative z-10">
                    <div
                      className={`text-lg font-black leading-none tracking-tighter drop-shadow-sm ${
                        slot.status === SlotStatus.MYBOOKING
                          ? "text-indigo-900"
                          : slot.status === SlotStatus.PAST
                          ? "text-gray-600"
                          : slot.status === SlotStatus.BOOKED
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {slot.time.split(":")[0]}
                    </div>
                    <div
                      className={`text-[10px] font-mono uppercase tracking-[0.05em] opacity-70 drop-shadow-sm ${
                        slot.status === SlotStatus.MYBOOKING
                          ? "text-indigo-600"
                          : slot.status === SlotStatus.PAST
                          ? "text-gray-500"
                          : slot.status === SlotStatus.BOOKED
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {slot.time.split(":")[1]}
                    </div>
                  </div>

                  {/* 👈 FIXED #2: NO ANIMATIONS - removed animate-pulse */}
                  {slot.status === SlotStatus.MYBOOKING ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-400/30 via-transparent to-transparent rounded-xl flex items-end pb-1">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg mx-auto flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">
                          👤
                        </span>
                      </div>
                    </div>
                  ) : slot.status === SlotStatus.PAST ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent rounded-xl flex items-end pb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg mx-auto" />
                    </div>
                  ) : slot.status === SlotStatus.BOOKED ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-red-400/20 via-transparent to-transparent rounded-xl flex items-end pb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg mx-auto" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg group-hover:scale-125 transition-all duration-200" />
                  )}

                  {selected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl shadow-inner" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12 text-gray-500">
          <p className="text-lg font-medium">{t("selectDateFirst")}</p>
        </div>
      )}

      {/* Price */}
      <div className="py-4 border-t border-gray-100 flex-1 flex flex-col justify-end">
        <div className="flex items-start gap-2 text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
          <span className="text-2xl relative -top-0.5">
            ${totalPrice.toFixed(2)}
          </span>
          <span className="text-lg font-semibold text-gray-500 flex-1 min-w-0">
            {currentSlot.start
              ? `${currentSlot.start}-${currentSlot.end} (${hours}h)`
              : t("selectSlot1h")}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {t("basePrice", { price: field.pricePerHour || 25, unit: "hr" })}
        </div>
      </div>

      {/* CTA */}
      {currentSlot.start &&
      currentSlot.end &&
      isAvailable &&
      isValidBookingRange() ? (
        <button
          onClick={handleBook}
          disabled={updating}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl border border-transparent focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
        >
          {updating
            ? t("booking")
            : `${t("bookNow")} $${totalPrice.toFixed(2)} (1h)`}
        </button>
      ) : selectedDate ? (
        <div className="text-center py-5 space-y-2">
          <p className="text-lg font-semibold text-gray-500">
            {t("clickSlot1h")}
          </p>
          <div className="text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 font-bold shadow-sm bg-gray-100 text-gray-800 shadow-gray-200/50">
            {availableSlots.length}/{FIXED_SLOTS.length} {t("slotsFree")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
