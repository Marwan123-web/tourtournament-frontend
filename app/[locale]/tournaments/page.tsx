"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tournament } from "@/types/api";
import { Sport, TournamentStatus } from "@/enums/enums";
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
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await tournamentApi.getTournaments();
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
