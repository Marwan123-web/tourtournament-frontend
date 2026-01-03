"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User, Tournament } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { FormInput } from "@/components/FormInput";
import { Select } from "@/components/Select";
import { authApi, tournamentApi, getErrorMessage } from "@/lib/api";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/StatusBadge";

export default function ProfilePage() {
  const t = useTranslations("profile");

  const [user, setUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
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
      setShowEditModal(false);
      await fetchProfile();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" message={t("loading")} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-gray-500">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-white">👤</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {user.username || user.email}
          </h1>
          <p className="text-xl text-gray-500">{t("memberSince")}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("settingsTitle")}
            </h2>
            <button
              onClick={() => setShowEditModal(true)}
              disabled={updating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 transition-colors"
            >
              {updating ? t("updating") : t("editProfile")}
            </button>
          </div>

          {!showEditModal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("username")}
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {user.username || t("notSet")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("tournamentsTitle", { count: tournaments.length })}
            </h2>
            <Link
              href="/tournaments"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              {t("createTournament")}
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">{t("noTournaments")}</p>
              <Link
                href="/tournaments"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                {t("createFirst")}
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
                  <StatusBadge status={tournament.status} />
                  <p className="text-sm text-gray-500 mt-2">
                    {tournament.currentTeams}/{tournament.maxTeams} {t("teams")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <CreateEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={t("editModal.title")}
          onSubmit={handleUpdateProfile}
          updating={updating}
          submitText={t("saveChanges")}
        >
          <ErrorBanner error={error} />

          <FormInput
            label={t("username")}
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={updating}
          />

          <FormInput
            label={t("email")}
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={updating}
          />
        </CreateEditModal>
      )}
    </div>
  );
}
