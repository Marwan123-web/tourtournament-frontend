"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Match, Team } from "@/types/api";
import { MatchStatus } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { StatusBadge } from "@/components/StatusBadge";
import { FormInput } from "@/components/FormInput";
import { Select } from "@/components/Select";
import { matchesApi, teamsApi, getErrorMessage } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function TournamentMatchesPage() {
  const t = useTranslations("tournaments.matches");
  const params = useParams();
  const tournamentId = params.id as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState({
    tournamentId,
    team1Id: "",
    team2Id: "",
    scheduledAt: "",
    round: "",
    status: MatchStatus.SCHEDULED,
  });

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentMatches();
      fetchTeams();
    }
  }, [tournamentId]);

  const fetchTournamentMatches = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await matchesApi.getTournamentMatches(tournamentId);
      setMatches(data);
    } catch (error: unknown) {
      setError(t("errors.loadMatches"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamsApi.getTournamentTeams(tournamentId);
      setTeams(data);
    } catch (error: unknown) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await matchesApi.createMatch(newMatch);
      setShowCreateModal(false);
      setNewMatch({
        tournamentId,
        team1Id: "",
        team2Id: "",
        scheduledAt: "",
        round: "",
        status: MatchStatus.SCHEDULED,
      });
      await fetchTournamentMatches();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateScore = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    setUpdating(true);
    setError("");

    try {
      await matchesApi.updateScore(matchId, { homeScore, awayScore });
      setEditingMatch(null);
      await fetchTournamentMatches();
    } catch (error: unknown) {
      setError(t("errors.updateScore"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message={t("loading")} />;

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <ErrorBanner error={error} onClear={() => setError('')} />

      <div className="flex justify-between items-center">
        <div>
          <Link
            href={`/tournaments/${tournamentId}`}
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← {t("backToTournament")}
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-500 text-lg">Tournament {tournamentId}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {updating ? t("creating") : t("createMatch")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {match.round}
              </span>
              <StatusBadge status={match.status} />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {match.homeTeam.name}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {match.homeScore ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="w-24 h-1 bg-gray-300 rounded-full relative">
                  {match.homeScore !== null && match.awayScore !== null && (
                    <div
                      className="h-1 bg-indigo-600 rounded-full absolute left-0 top-0 transition-all duration-300"
                      style={{
                        width: `${
                          (match.homeScore! /
                            (match.homeScore! + match.awayScore!)) *
                          100
                        }%`,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {match.awayTeam.name}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {match.awayScore ?? "-"}
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {new Date(match.scheduledAt).toLocaleString()}
            </div>

            {match.status === MatchStatus.SCHEDULED && (
              <button
                onClick={() => setEditingMatch(match)}
                disabled={updating}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 text-sm font-medium disabled:opacity-50"
              >
                {updating ? t("updating") : t("setResult")}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Match Modal */}
      <CreateEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t("createModal.title")}
        onSubmit={handleCreateMatch}
        updating={updating}
        submitText={t("createMatch")}
      >
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm font-medium text-indigo-800">
            {t("createModal.tournament")}: Tournament #{tournamentId}
          </p>
        </div>

        <Select
          label={t("createModal.homeTeam")}
          id="home-team"
          value={newMatch.team1Id}
          onChange={(e) =>
            setNewMatch({ ...newMatch, team1Id: e.target.value })
          }
          options={teamOptions}
          required
          disabled={updating}
        />

        <Select
          label={t("createModal.awayTeam")}
          id="away-team"
          value={newMatch.team2Id}
          onChange={(e) =>
            setNewMatch({ ...newMatch, team2Id: e.target.value })
          }
          options={teamOptions}
          required
          disabled={updating}
        />

        <FormInput
          label={t("createModal.scheduled")}
          id="scheduled"
          type="datetime-local"
          value={newMatch.scheduledAt}
          onChange={(e) =>
            setNewMatch({ ...newMatch, scheduledAt: e.target.value })
          }
          required
          disabled={updating}
        />

        <FormInput
          label={t("createModal.round")}
          id="round"
          value={newMatch.round}
          onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
          placeholder="e.g. Quarterfinals"
          required
          disabled={updating}
        />
      </CreateEditModal>

      {/* Edit Score Modal */}
      {editingMatch && (
        <CreateEditModal
          isOpen={!!editingMatch}
          onClose={() => setEditingMatch(null)}
          title={`${editingMatch.homeTeam.name} vs ${editingMatch.awayTeam.name}`}
          onSubmit={(e) => {
            e.preventDefault();
            const homeScore =
              (document.getElementById("homeScore") as HTMLInputElement)
                ?.valueAsNumber || 0;
            const awayScore =
              (document.getElementById("awayScore") as HTMLInputElement)
                ?.valueAsNumber || 0;
            handleUpdateScore(editingMatch.id, homeScore, awayScore);
          }}
          updating={updating}
          submitText={t("saveResult")}
        >
          <ErrorBanner error={error} onClear={() => setError('')} />

          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingMatch.homeTeam.name}
              </label>
              <FormInput
                id="homeScore"
                type="number"
                min={0}
                value={editingMatch.homeScore ?? 0}
                onChange={() => {}} // Controlled by form submit
                disabled={updating}
                className="w-20 mx-auto text-center text-2xl font-bold"
              />
            </div>
            <span className="text-3xl font-bold text-gray-400">VS</span>
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingMatch.awayTeam.name}
              </label>
              <FormInput
                id="awayScore"
                type="number"
                min={0}
                value={editingMatch.awayScore ?? 0}
                onChange={() => {}} // Controlled by form submit
                disabled={updating}
                className="w-20 mx-auto text-center text-2xl font-bold"
              />
            </div>
          </div>
        </CreateEditModal>
      )}
    </div>
  );
}
