"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Booking, Field } from "@/types/api";
import { BookingStatus, Sport, Sports } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { StatusBadge } from "@/components/StatusBadge";
import { fieldsApi, bookingsApi } from "@/lib/api";
import { calculateTotalPrice, formatDate, formatTime } from "@/lib/date-utils";
import { useTranslations } from "next-intl";
import { FormInput } from "@/components/FormInput";
import FieldCard from "@/components/field/FieldCard";

export default function FieldsPage() {
  const t = useTranslations("fields");

  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCreateField, setShowCreateField] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    sport: Sport.FOOTBALL as Sport,
    capacity: 11,
    address: "",
    pricePerHour: 50,
  });

  useEffect(() => {
    fetchFields();
    fetchBookings();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fieldsApi.getFields();
      setFields(data);
    } catch (error: unknown) {
      setError(t("errors.fields"));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setError("");
      const data = await bookingsApi.getBookings();
      setBookings(data);
    } catch (error: unknown) {
      setError(t("errors.bookings"));
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await fieldsApi.createField(newField);
      setShowCreateField(false);
      setNewField({
        name: "",
        sport: Sport.FOOTBALL,
        capacity: 11,
        address: "",
        pricePerHour: 50,
      });
      await fetchFields();
    } catch (error: unknown) {
      setError(t("errors.createField"));
    } finally {
      setUpdating(false);
    }
  };

  const handleBookField = async (
    fieldId: string,
    startTime: string,
    endTime: string
  ) => {
    if (!confirm(t("confirmBooking"))) return;

    setUpdating(true);
    setError("");

    try {
      await bookingsApi.createBooking({ fieldId, startTime, endTime });
      await fetchBookings();
    } catch (error: unknown) {
      setError(t("errors.bookField"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message={t("loading")} />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <ErrorBanner error={error} onClear={() => setError("")} />

      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← {t("backToTournaments")}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
        </div>
        <button
          onClick={() => setShowCreateField(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {updating ? t("creating") : t("addField")}
        </button>
      </div>

      {/* Fields Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-8">{t("availableFields")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              selectedDate={selectedDate}
              updating={updating}
              onBook={handleBookField}
            />
          ))}

          {/* {fields.map((field) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {field.name}
                </h3>
                <StatusBadge
                  status={field.isAvailable ? "available" : "booked"}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full capitalize">
                    {field.sport}
                  </span>
                  <span>
                    {field.capacity} {t("players")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{field.address}</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${field.pricePerHour}/{t("perHour")}
                </p>
              </div>
              {field.isAvailable && (
                <button
                  onClick={() => {
                    const startTime = `${selectedDate}T18:00`;
                    const endTime = `${selectedDate}T20:00`;
                    handleBookField(field.id, startTime, endTime);
                  }}
                  disabled={updating}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {updating ? t("booking") : t("bookNow")}
                </button>
              )}
            </div>
          ))} */}
        </div>
      </section>

      {/* Create Field Modal */}
      <CreateEditModal
        isOpen={showCreateField}
        onClose={() => setShowCreateField(false)}
        title={t("createModal.title")}
        onSubmit={handleCreateField}
        updating={updating}
        submitText={t("createField")}
      >
        <FormInput
          label={t("createModal.name")}
          id="name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          required
          disabled={updating}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("createModal.sport")}
          </label>
          <select
            value={newField.sport}
            onChange={(e) =>
              setNewField({
                ...newField,
                sport: e.target.value as Sport,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={updating}
          >
            {Sports.map((sport) => (
              <option value={sport.value} key={sport.id}>
                {t(sport.name)}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          label={t("createModal.capacity")}
          id="capacity"
          type="number"
          value={newField.capacity}
          onChange={(e) =>
            setNewField({
              ...newField,
              capacity: parseInt(e.target.value),
            })
          }
          required
          disabled={updating}
        />

        <FormInput
          label={t("createModal.address")}
          id="address"
          value={newField.address}
          onChange={(e) =>
            setNewField({ ...newField, address: e.target.value })
          }
          required
          disabled={updating}
        />

        <FormInput
          label={t("createModal.price")}
          id="price"
          type="number"
          value={newField.pricePerHour}
          onChange={(e) =>
            setNewField({
              ...newField,
              pricePerHour: parseInt(e.target.value),
            })
          }
          required
          disabled={updating}
        />
      </CreateEditModal>
    </div>
  );
}
