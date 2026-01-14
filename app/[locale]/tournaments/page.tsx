"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tournament } from "@/types/api";
import { Sport, Sports, TournamentStatus } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { Select } from "@/components/Select";
import { StatusBadge } from "@/components/StatusBadge";
import { FormInput } from "@/components/FormInput";
import { tournamentApi, getErrorMessage } from "@/lib/api";
import { useTranslations } from "next-intl";
import TournamentCard from "@/components/tournament/TournamentCard";

export default function TournamentsPage() {
  const t = useTranslations("tournaments.list");

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: "",
    sport: Sport.FOOTBALL,
    maxTeams: 16,
    startDate: "",
    endDate: "",
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSport, setSelectedSport] = useState<Sport | string>("");
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, [selectedDate, selectedSport, t]);

  const fetchTournaments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await tournamentApi.getTournaments({
        sport: selectedSport,
      });
      setTournaments(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await tournamentApi.createTournament(newTournament);
      setShowCreateModal(false);
      setNewTournament({
        name: "",
        sport: Sport.FOOTBALL,
        maxTeams: 16,
        startDate: "",
        endDate: "",
      });
      await fetchTournaments();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.REGISTRATION:
        return "bg-green-100 text-green-800";
      case TournamentStatus.ONGOING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" message={t("loading")} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <ErrorBanner error={error} onClear={() => setError("")} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={creating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
        >
          {t("createButton")}
        </button>
      </div>
      {/* Date Picker and Sport */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-6 rounded-2xl border shadow-sm">
        {/* <div className="flex flex-col sm:flex-row gap-4 items-center">
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
        </div> */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {/* Create Tournament Modal */}
      <CreateEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t("modal.title")}
        onSubmit={handleCreate}
        updating={creating}
        submitText={t("createButton")}
      >
        <FormInput
          label={t("modal.name")}
          id="tournament-name"
          value={newTournament.name}
          onChange={(e) =>
            setNewTournament({ ...newTournament, name: e.target.value })
          }
          required
          disabled={creating}
        />

        <Select
          label={t("modal.sport")}
          id="tournament-sport"
          value={newTournament.sport}
          onChange={(e) =>
            setNewTournament({
              ...newTournament,
              sport: e.target.value as Sport,
            })
          }
          options={[
            { value: Sport.FOOTBALL, label: t("sports.football") },
            { value: Sport.VOLLEYBALL, label: t("sports.volleyball") },
            { value: Sport.BASKETBALL, label: t("sports.basketball") },
          ]}
          disabled={creating}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label={t("modal.startDate")}
            id="start-date"
            type="date"
            value={newTournament.startDate}
            onChange={(e) =>
              setNewTournament({ ...newTournament, startDate: e.target.value })
            }
            required
            disabled={creating}
          />
          <FormInput
            label={t("modal.endDate")}
            id="end-date"
            type="date"
            value={newTournament.endDate}
            onChange={(e) =>
              setNewTournament({ ...newTournament, endDate: e.target.value })
            }
            required
            disabled={creating}
          />
        </div>

        <FormInput
          label={t("modal.maxTeams")}
          id="max-teams"
          type="number"
          value={newTournament.maxTeams}
          onChange={(e) =>
            setNewTournament({
              ...newTournament,
              maxTeams: parseInt(e.target.value),
            })
          }
          min={2}
          max={128}
          required
          disabled={creating}
        />
      </CreateEditModal>
    </div>
  );
}
