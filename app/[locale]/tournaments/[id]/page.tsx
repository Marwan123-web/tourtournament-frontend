"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Tournament, TeamStanding, Team } from "@/types/api";
import { TournamentStatus, Sport } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { Select } from "@/components/Select";
import { StatusBadge } from "@/components/StatusBadge";
import { tournamentApi, teamsApi, getErrorMessage } from "@/lib/api";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/DataTable";
import { FormInput } from "@/components/FormInput";
import TeamCard from "@/components/team/TeamCard";

export default function TournamentDetail() {
  const t = useTranslations("tournaments.detail");
  const params = useParams();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "football" as Sport,
  });

  useEffect(() => {
    if (params.id) fetchTournament();
  }, [params.id]);

  const fetchTournament = async () => {
    setLoading(true);
    setError("");

    try {
      const [tournamentData, standingsData, teamsData] = await Promise.all([
        tournamentApi.getTournament(params.id as string),
        tournamentApi.getStandings(params.id as string),
        tournamentApi.getTeamsByTournament(params.id as string),
      ]);

      setTournament(tournamentData);
      setStandings(standingsData);
      setTeams(teamsData);
      setNewTeam((prev) => ({ ...prev, sport: tournamentData.sport }));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await teamsApi.createTeam({
        tournamentId: params.id as string,
        name: newTeam.name,
      });
      setShowCreateTeam(false);
      setNewTeam({ name: "", sport: tournament?.sport || Sport.FOOTBALL });
      await fetchTournament();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" message={t("loading")} />;
  }

  if (!tournament) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("notFound")}
          </h2>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← {t("backToTournaments")}
          </Link>
        </div>
      </div>
    );
  }

  const standingsColumns = [
    { key: "position" as keyof TeamStanding, label: t("standings.pos") },
    {
      key: "team" as keyof TeamStanding,
      label: t("standings.team"),
      render: (standing: TeamStanding) => standing.team.name,
    },
    { key: "played" as keyof TeamStanding, label: t("standings.p") },
    { key: "wins" as keyof TeamStanding, label: t("standings.w") },
    { key: "draws" as keyof TeamStanding, label: t("standings.d") },
    { key: "losses" as keyof TeamStanding, label: t("standings.l") },
    { key: "goalDifference" as keyof TeamStanding, label: t("standings.gd") },
    {
      key: "points" as keyof TeamStanding,
      label: t("standings.pts"),
      render: (standing: TeamStanding) => (
        <span className="font-bold">{standing.points}</span>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <ErrorBanner error={error} onClear={() => setError('')} />

      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← {t("backToTournaments")}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="capitalize">{tournament.sport}</span>
            <span>
              {tournament.currentTeams}/{tournament.maxTeams} {t("teams")}
            </span>
            <StatusBadge status={tournament.status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-2xl font-bold text-gray-900">
            {tournament.startDate} - {tournament.endDate}
          </p>
          <StatusBadge
            status={tournament.isActive ? "active" : "inactive"}
            className="text-sm px-3 py-1"
          />
          {(tournament.status === TournamentStatus.REGISTRATION && tournament.currentTeams < tournament.maxTeams) && (
            <button
              onClick={() => setShowCreateTeam(true)}
              disabled={updating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? t("creating") : t("createTeam")}
            </button>
          )}
        </div>
      </div>

      {/* Standings */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t("standingsTitle")}</h2>
          <Link
            href={`/tournaments/${tournament.id}/matches`}
            className="text-indigo-600 hover:underline"
          >
            {t("viewMatches")}
          </Link>
        </div>
        <DataTable data={standings} columns={standingsColumns} />
      </section>

      {/* Teams */}
      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-6">
            {t("teamsTitle", {
              current: tournament.currentTeams,
              max: tournament.maxTeams,
            })}
          </h2>
          <Link
            href={`/tournaments/${tournament.id}/teams`}
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
             {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
            />
          ))}
        </div>
      </section>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateEditModal
          isOpen={showCreateTeam}
          onClose={() => setShowCreateTeam(false)}
          title={t("createModal.title", { tournament: tournament.name })}
          onSubmit={handleCreateTeam}
          updating={updating}
          submitText={t("createTeam")}
        >
          <FormInput
            label={t("createModal.name")}
            id="team-name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
            disabled={updating}
          />
        </CreateEditModal>
      )}
    </div>
  );
}
