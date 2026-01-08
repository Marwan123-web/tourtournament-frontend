"use client";

import { PropsWithChildren, useState } from "react";
import { Field, Slot } from "@/types/api";
import { useTranslations } from "next-intl";
import { StatusBadge } from "../StatusBadge";
import { FIXED_SLOTS } from "@/enums/enums";

interface FieldCardProps extends PropsWithChildren {
  field: Field;
  selectedDate?: string;
  updating?: boolean;
  onBook: (fieldId: string, startTime: string, endTime: string) => void;
}

export default function FieldCard({ field, selectedDate, updating = false, onBook }: FieldCardProps) {
  const t = useTranslations("fields");
  const playerCount = field.capacity ?? 0;
  const [currentSlot, setCurrentSlot] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // 🔥 FIXED: Correct slot availability logic
  const slots: Slot[] = (() => {
    if (!selectedDate) return [];
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    const todayBookings = field.bookings.filter(b => b.isActive);
    const bookedRanges: { start: number; end: number }[] = [];
    todayBookings.forEach(booking => {
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = parseInt(booking.endTime.split(':')[0]);
      bookedRanges.push({ start: startHour, end: endHour });
    });

    return FIXED_SLOTS.map(slotTime => {
      const slotHour = parseInt(slotTime.split(':')[0]);
      
      let isPast = false;
      if (isToday) {
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();
        
        if (slotHour < nowHour) {
          isPast = true;
        } else if (slotHour === nowHour) {
          isPast = nowMinute >= 0;
        }
      }
      
      // 🔥 CORRECTED: Slot is ONLY booked if it's the START of an existing booking
      // End slots are always selectable for range selection
      // const isBooked = bookedRanges.some(range => slotHour === range.start);
      const isBooked = bookedRanges.some(range => 
        // Slot is a start hour for any hour in the booking range
        slotHour >= range.start && slotHour < range.end
      );
      
      return {
        time: slotTime,
        available: !isPast && !isBooked,
        status: isPast ? 'past' : isBooked ? 'booked' : 'available'
      };
    });
  })();

  const availableSlots = slots.filter(s => s.available);
  const isAvailable = availableSlots.length > 0;
  const hours = currentSlot.end ? (parseInt(currentSlot.end.split(':')[0]) - parseInt(currentSlot.start.split(':')[0])) || 1 : 1;
  const totalPrice = (field.pricePerHour || 25) * hours;

  const updateSelectedSlot = (time: string) => {
    if (!currentSlot.start) {
      setCurrentSlot({ start: time, end: '' });
    } else if (currentSlot.start === time) {
      setCurrentSlot({ start: '', end: '' });
    } else if (!currentSlot.end) {
      const startHour = parseInt(currentSlot.start.split(':')[0]);
      const endHour = parseInt(time.split(':')[0]);
      setCurrentSlot({ 
        start: startHour < endHour ? currentSlot.start : time,
        end: startHour < endHour ? time : currentSlot.start 
      });
    } else {
      setCurrentSlot({ start: time, end: '' });
    }
  };

  // 🔥 IMPROVED: Proper range overlap validation
  const isValidBookingRange = () => {
    if (!currentSlot.start || !currentSlot.end) return false;
    
    const startHour = parseInt(currentSlot.start.split(':')[0]);
    const endHour = parseInt(currentSlot.end.split(':')[0]);
    
    const todayBookings = field.bookings.filter(b => b.isActive);
    for (const booking of todayBookings) {
      const bookStart = parseInt(booking.startTime.split(':')[0]);
      const bookEnd = parseInt(booking.endTime.split(':')[0]);
      
      // Overlap if: newStart < bookEnd && newEnd > bookStart
      if (startHour < bookEnd && endHour > bookStart) {
        return false;
      }
    }
    return true;
  };

  const handleBook = () => {
    if (selectedDate && currentSlot.start && currentSlot.end && isAvailable && isValidBookingRange()) {
      onBook(field.id, `${selectedDate}T${currentSlot.start}`, `${selectedDate}T${currentSlot.end}`);
    }
  };

  const isStartSelected = (time: string) => currentSlot.start === time;
  const isEndSelected = (time: string) => currentSlot.end === time;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md p-8 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-4">{field.name}</h3>
        </div>
        <StatusBadge status={isAvailable ? "available" : "booked"} size="lg" />
      </div>

      {/* Stats */}
      <div className="flex flex-row flex-wrap gap-4">
        <div className="inline-flex items-center px-4 bg-gray-100 text-gray-800 text-sm font-bold rounded-xl shadow-sm border border-gray-200">
          {field.sport?.toUpperCase()}
        </div>
        <div className="flex items-center gap-3 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <span className="w-5 h-5 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm text-lg">👥</span>
          <div>
            <div className="text-xl font-bold text-gray-900">{playerCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("players")}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors flex-1 min-w-[200px]">
          <span className="w-5 h-5 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center shadow-sm text-lg">📍</span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm line-clamp-2">{field.address}</div>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      {selectedDate ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">{t("slotRange", { defaultMessage: "09:00 - 20:00" })}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              availableSlots.length === FIXED_SLOTS.length 
                ? 'bg-emerald-100 text-emerald-800' 
                : availableSlots.length > FIXED_SLOTS.length / 2
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {availableSlots.length}/{FIXED_SLOTS.length} {t("free", { defaultMessage: "free" })}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border-2 border-dashed border-gray-200">
            {slots.map(slot => {
              const isStart = isStartSelected(slot.time);
              const isEnd = isEndSelected(slot.time);

              return (
                <button
                  key={slot.time}
                  onClick={() => updateSelectedSlot(slot.time)}
                  disabled={!slot.available}
                  className={`
                    group relative p-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-xl border-4 overflow-hidden min-h-[64px] flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-[1.05] active:scale-95
                    ${isStart 
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-100/95 via-emerald-50 to-emerald-100 shadow-emerald-400/50 ring-2 ring-emerald-200/50' 
                      : isEnd 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-100/95 via-blue-50 to-blue-100 shadow-blue-400/50 ring-2 ring-blue-200/50'
                      : slot.status === 'past'
                      ? 'border-gray-400/40 bg-gradient-to-br from-gray-100/70 to-gray-200/70 shadow-gray-200/40 cursor-not-allowed opacity-65 hover:opacity-65'
                      : slot.status === 'booked'
                      ? 'border-red-400/40 bg-gradient-to-br from-red-50/80 to-red-100/80 shadow-red-200/40 cursor-not-allowed opacity-80 hover:opacity-80'
                      : 'border-transparent bg-white/85 hover:bg-gradient-to-br hover:from-emerald-50/85 hover:to-indigo-50/85 hover:border-emerald-300/50 hover:shadow-emerald-150/50 shadow-sm hover:shadow-lg hover:-translate-y-px'
                    }
                  `}
                  title={
                    slot.status === 'past' ? t("pastTime", { defaultMessage: "Past time" }) :
                    slot.status === 'booked' ? t("slotBooked", { defaultMessage: "Slot booked" }) :
                    `${isStart ? t("startTime", { defaultMessage: "Start" }) : 
                      isEnd ? t("endTime", { defaultMessage: "End" }) : 
                      t("selectSlot", { defaultMessage: "Select slot" })}`
                  }
                >
                  {/* Stacked Time */}
                  <div className="flex flex-col items-center gap-px relative z-10">
                    <div className={`text-lg font-black leading-none tracking-tighter drop-shadow-sm ${
                      slot.status === 'past' ? 'text-gray-600' :
                      slot.status === 'booked' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {slot.time.split(':')[0]}
                    </div>
                    <div className={`text-[10px] font-mono uppercase tracking-[0.05em] opacity-70 drop-shadow-sm ${
                      slot.status === 'past' ? 'text-gray-500' :
                      slot.status === 'booked' ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      {slot.time.split(':')[1]}
                    </div>
                  </div>

                  {/* Status Dots */}
                  {slot.status === 'past' ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent rounded-xl flex items-end pb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg animate-pulse mx-auto" />
                    </div>
                  ) : slot.status === 'booked' ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-red-400/20 via-transparent to-transparent rounded-xl flex items-end pb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg animate-pulse mx-auto" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg group-hover:scale-125 transition-all duration-200" />
                  )}

                  {/* Selection Glow */}
                  {(isStart || isEnd) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse rounded-xl shadow-inner" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12 text-gray-500">
          <p className="text-lg font-medium">{t("selectDateFirst", { defaultMessage: "Select a date to see slots" })}</p>
        </div>
      )}

      {/* Price */}
      <div className="py-4 border-t border-gray-100 flex-1 flex flex-col justify-end">
        <div className="flex items-start gap-2 text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
          <span className="text-2xl relative -top-0.5">${totalPrice.toFixed(2)}</span>
          <span className="text-lg font-semibold text-gray-500 flex-1 min-w-0">
            {currentSlot.start ? `${currentSlot.start}-${currentSlot.end}` : t("selectSlots", { defaultMessage: 'Select slots' })} ({hours}h)
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {t("basePrice", { defaultMessage: "Base", price: field.pricePerHour || 25, unit: "hr" })}
        </div>
      </div>

      {/* CTA */}
      {currentSlot.start && currentSlot.end && isAvailable && isValidBookingRange() ? (
        <button
          onClick={handleBook}
          disabled={updating}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl border border-transparent focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
        >
          {updating ? t("booking", { defaultMessage: "Booking" }) : `${t("bookNow", { defaultMessage: "Book Now" })} $${totalPrice.toFixed(2)}`}
        </button>
      ) : selectedDate ? (
        <div className="text-center py-5 space-y-2">
          <p className={`text-lg font-semibold mb-2 ${
            currentSlot.start && !currentSlot.end 
              ? 'text-amber-600' 
              : !isValidBookingRange() && currentSlot.start && currentSlot.end
              ? 'text-red-600'
              : 'text-gray-500'
          }`}>
            {currentSlot.start && !currentSlot.end 
              ? t("selectEndTime", { defaultMessage: "Select end time →" })
              : currentSlot.start && currentSlot.end && !isValidBookingRange()
              ? t("overlapsBooking", { defaultMessage: "Overlaps existing booking" })
              : t("selectStartEnd", { defaultMessage: "Click start → end slots" })
            }
          </p>
          <div className={`text-xs px-4 py-2 rounded-full inline-flex items-center gap-1 font-bold shadow-sm ${
            availableSlots.length === FIXED_SLOTS.length 
              ? 'bg-emerald-100 text-emerald-800 shadow-emerald-200/50' 
              : availableSlots.length >= 6
              ? 'bg-amber-100 text-amber-800 shadow-amber-200/50'
              : 'bg-gray-100 text-gray-800 shadow-gray-200/50'
          }`}>
            {availableSlots.length}/{FIXED_SLOTS.length} {t("slotsFree", { defaultMessage: "slots free" })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 space-y-1">
          <p className="font-semibold">{t("pickDate", { defaultMessage: "Pick a date first" })}</p>
          <p className="text-sm opacity-75">{t("seeAvailability", { defaultMessage: "to see availability" })}</p>
        </div>
      )}
    </div>
  );
}
