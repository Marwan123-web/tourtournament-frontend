"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Team, Tournament } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { FormInput } from "@/components/FormInput";
import { Select } from "@/components/Select";
import { teamsApi, tournamentApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Sport } from "@/enums/enums";

export default function TournamentTeamsPage() {
  const t = useTranslations("tournaments.teams");
  const params = useParams();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "football",
  });

  useEffect(() => {
    if (params.id) fetchTournamentTeams();
  }, [params.id]);

  const fetchTournamentTeams = async () => {
    try {
      setLoading(true);
      setError("");
      const [tournamentData, teamsData] = await Promise.all([
        tournamentApi.getTournament(params.id as string),
        teamsApi.getTournamentTeams(params.id as string),
      ]);

      setTournament(tournamentData);
      setTeams(teamsData);
      setNewTeam((prev) => ({ ...prev, sport: tournamentData.sport }));
    } catch (error: unknown) {
      setError(t("errors.loadTeams"));
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
        sport: newTeam.sport as Sport,
      });
      setShowCreateTeam(false);
      setNewTeam({
        name: "",
        sport: tournament?.sport || "football",
      });
      await fetchTournamentTeams();
    } catch (error: unknown) {
      setError(t("errors.createTeam"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message={t("loading")} />;

  if (!tournament) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">{t("notFound")}</div>
        <Link href="/tournaments" className="text-indigo-600 hover:underline">
          ← {t("backToTournaments")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <ErrorBanner error={error} onClear={() => setError('')} />

      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
          >
            ← {t("backToTournaments")}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium capitalize">
              {tournament.sport}
            </span>
            <span>
              {teams.length}/{tournament.maxTeams} {t("teams")}
            </span>
          </div>
        </div>
        {tournament.status === "registration" && (
          <button
            onClick={() => setShowCreateTeam(true)}
            disabled={updating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            {updating ? t("creating") : t("createTeam")}
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-8">
          {t("teamsTitle", { count: teams.length })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {team.name}
                </h3>
                <Link
                  href={`/teams/${team.id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium whitespace-nowrap"
                >
                  {t("viewTeam")}
                </Link>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full capitalize">
                    {team.sport}
                  </span>
                  <span>
                    {team.players?.length || 0} {t("players")}
                  </span>
                </div>
                {team.tournament && (
                  <p className="text-sm text-gray-500">
                    {team.tournament.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create Team Modal */}
      <CreateEditModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        title={t("createModal.title")}
        onSubmit={handleCreateTeam}
        updating={updating}
        submitText={t("createTeam")}
      >
        <FormInput
          label={t("createModal.name")}
          id="team-name"
          value={newTeam.name}
          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          placeholder="e.g. FC Galaxy"
          required
          disabled={updating}
        />

        <Select
          label={t("createModal.sport")}
          id="team-sport"
          value={newTeam.sport}
          onChange={(e) => setNewTeam({ ...newTeam, sport: e.target.value })}
          options={[
            { value: "football", label: t("sports.football") },
            { value: "volleyball", label: t("sports.volleyball") },
            { value: "basketball", label: t("sports.basketball") },
          ]}
          disabled={updating}
        />
      </CreateEditModal>
    </div>
  );
}
