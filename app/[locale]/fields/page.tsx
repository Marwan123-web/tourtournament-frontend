"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Field } from "@/types/api";
import { Sport, Sports } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { fieldsApi, bookingsApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import { FormInput } from "@/components/FormInput";
import FieldCard from "@/components/field/FieldCard";

export default function FieldsPage() {
  const t = useTranslations("fields");

  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSport, setSelectedSport] = useState<Sport | string>("");
  const [showCreateField, setShowCreateField] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    sport: "FOOTBALL" as Sport,
    capacity: 11,
    address: "",
    pricePerHour: 50,
  });

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fieldsApi.getFields({
        date: selectedDate,
        q: selectedSport,
      });
      setFields(data);
    } catch (error: unknown) {
      setError(t("errors.fields"));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSport, t]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

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
      await bookingsApi.createBooking(fieldId, {
        date: selectedDate!,
        startTime: startTime.split("T")[1]!,
        endTime: endTime.split("T")[1]!,
      });
      await fetchFields(); // Refresh fields (new booking appears)
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

      {/* Header */}
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {updating ? t("creating") : t("addField")}
        </button>
      </div>

      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {t("selectDate")}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {t("selectSport")}
          </label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">{t("AllSports")}</option>
            {Sports.map((sport) => (
              <option key={sport.id} value={sport.value}>
                {t(sport.name)}
              </option>
            ))}
          </select>
        </div>
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
              setNewField({ ...newField, sport: e.target.value as Sport })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={updating}
          >
            {Sports.map((sport) => (
              <option key={sport.id} value={sport.value}>
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
            setNewField({ ...newField, capacity: parseInt(e.target.value) })
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
              pricePerHour: parseFloat(e.target.value),
            })
          }
          required
          disabled={updating}
        />
      </CreateEditModal>
    </div>
  );
}
