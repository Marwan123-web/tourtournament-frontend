"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Booking, Field } from "@/types/api";
import { BookingStatus, Sport } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fieldsApi, bookingsApi } from "@/lib/api";
import { calculateTotalPrice, formatDate, formatTime } from "@/lib/date-utils";

export default function FieldsPage() {
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
      console.error("Failed to fetch fields:", error);
      setError("Failed to load fields. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setError("");
      const data = await bookingsApi.getBookings();
      console.log("data", data);

      setBookings(data);
    } catch (error: unknown) {
      console.error("Failed to fetch bookings:", error);
      setError("Failed to load bookings. Please try again.");
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
      console.error("Failed to create field:", error);
      setError("Failed to create field. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBookField = async (
    fieldId: string,
    startTime: string,
    endTime: string
  ) => {
    if (!confirm("Confirm booking?")) return;

    setUpdating(true);
    setError("");

    try {
      await bookingsApi.createBooking({ fieldId, startTime, endTime });
      await fetchBookings();
    } catch (error: unknown) {
      console.error("Failed to book field:", error);
      setError(
        "Failed to book field. Please check availability and try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message="Loading fields..." />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Fields & Bookings
          </h1>
        </div>
        <button
          onClick={() => setShowCreateField(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Creating..." : "Add Field"}
        </button>
      </div>

      {/* Fields Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8">Available Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {field.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    field.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {field.isAvailable ? "Available" : "Booked"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {field.sport.toUpperCase()}
                  </span>
                  <span>{field.capacity} players</span>
                </div>
                <p className="text-sm text-gray-500">{field.address}</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${field.pricePerHour}/hr
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
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Booking..." : "Book Now (2hr slot)"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bookings Calendar */}
      <section>
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {BookingStatus.CONFIRMED}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                {BookingStatus.CANCELLED}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings
              .filter((booking) => {
                const bookingDate = new Date(booking.date + "T00:00:00");
                const filterDate = new Date(selectedDate + "T00:00:00");
                return bookingDate <= filterDate;
              })
              .map((booking) => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {booking.field.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {BookingStatus.CONFIRMED}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(booking.date)} |{" "}
                    {formatTime(booking.date, booking.startTime)} -{" "}
                    {formatTime(booking.date, booking.endTime)}
                  </p>
                  <p className="text-sm font-medium text-indigo-600">
                    $
                    {calculateTotalPrice(
                      booking.date,
                      booking.startTime,
                      booking.endTime,
                      booking.field.pricePerHour
                    )}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Create Field Modal */}
      {showCreateField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New Field</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateField} className="space-y-4">
              <input
                type="text"
                placeholder="Field Name (e.g. Pitch 1)"
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              />
              <select
                value={newField.sport}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value as Sport;
                  setNewField({ ...newField, sport: value });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg"
                disabled={updating}
              >
                <option value="football">Football</option>
                <option value="volleyball">Volleyball</option>
                <option value="basketball">Basketball</option>
              </select>
              <input
                type="number"
                placeholder="Capacity"
                value={newField.capacity}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    capacity: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              />
              <input
                type="text"
                placeholder="Address"
                value={newField.address}
                onChange={(e) =>
                  setNewField({ ...newField, address: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              />
              <input
                type="number"
                placeholder="Price per hour ($)"
                value={newField.pricePerHour}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    pricePerHour: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Creating..." : "Create Field"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateField(false)}
                  disabled={updating}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
