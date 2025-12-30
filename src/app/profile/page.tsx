"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User, Tournament } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { authApi, tournamentApi, getErrorMessage } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const router = useRouter();

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [userData, userTournaments] = await Promise.all([
        authApi.whoami(),
        tournamentApi.getTournaments(),
      ]);

      setUser(userData);
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
      });
      setTournaments(
        userTournaments.filter((t) => t.creator.id === userData.id)
      );
    } catch (error: unknown) {
      console.error("Failed to fetch profile:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await authApi.updateProfile(formData);
      setEditMode(false);
      fetchProfile();
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" message="Loading your profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Failed to load profile
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 mx-auto"
            >
              <LoadingSpinner size="sm" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-white">👤</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {user.username || user.email}
          </h1>
          <p className="text-xl text-gray-500">Member since 2025</p>
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              disabled={updating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {updating ? "Updating..." : editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
                  placeholder="Enter username"
                  disabled={updating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50"
                  placeholder="Enter email"
                  disabled={updating}
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating && <LoadingSpinner size="sm" />}
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {user.username || "Not set"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* My Tournaments */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Tournaments ({tournaments.length})
          </h2>
          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No tournaments created yet
              </p>
              <Link
                href="/tournaments"
                className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create First Tournament
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 capitalize">
                    {tournament.sport}
                  </p>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mb-4 inline-block">
                    {tournament.status}
                  </span>
                  <p className="text-sm text-gray-500">
                    {tournament.currentTeams}/{tournament.maxTeams} teams
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
