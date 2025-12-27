"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Booking, Field } from "@/types/api";
import { BookingStatus, Sport } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCreateField, setShowCreateField] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    sport: Sport.FOOTBALL as Sport,
    capacity: 11,
    location: "",
    pricePerHour: 50,
  });

  useEffect(() => {
    fetchFields();
    fetchBookings();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch("/api/fields");
      const data = await res.json();
      setFields(data);
    } catch (error) {
      console.error("Failed to fetch fields");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings");
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });
      setShowCreateField(false);
      setNewField({
        name: "",
        sport: Sport.FOOTBALL,
        capacity: 11,
        location: "",
        pricePerHour: 50,
      });
      fetchFields();
    } catch (error) {
      console.error("Failed to create field");
    }
  };

  const handleBookField = async (
    fieldId: string,
    startTime: string,
    endTime: string
  ) => {
    if (!confirm("Confirm booking?")) return;
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, startTime, endTime }),
      });
      fetchBookings();
    } catch (error) {
      console.error("Failed to book field");
    }
  };

  if (loading) return <LoadingSpinner size="xl" message="Loading fields..." />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Field
        </button>
      </div>

      {/* Fields Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8">Available Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div
              key={field.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
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
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {field.sport.toUpperCase()}
                  </span>
                  <span>{field.capacity} players</span>
                </div>
                <p className="text-sm text-gray-500">{field.location}</p>
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
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Book Now (2hr slot)
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
                Confirmed
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                Cancelled
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings
              .filter((booking) => booking.startTime.startsWith(selectedDate))
              .map((booking) => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {booking.field.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === BookingStatus.CONFIRMED
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                    {new Date(booking.endTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm font-medium text-indigo-600">
                    $
                    {(
                      ((new Date(booking.endTime).getTime() -
                        new Date(booking.startTime).getTime()) /
                        3600000) *
                      booking.field.pricePerHour
                    ).toFixed(0)}
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
              />
              <select
                value={newField.sport}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value as Sport;
                  setNewField({ ...newField, sport: value });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg"
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
              />
              <input
                type="text"
                placeholder="Location"
                value={newField.location}
                onChange={(e) =>
                  setNewField({ ...newField, location: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
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
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700"
                >
                  Create Field
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateField(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300"
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
