"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Player, Team, Tournament } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { teamsApi, playersApi, tournamentApi } from "@/lib/api";

export default function TournamentTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "football" as string,
  });

  useEffect(() => {
    if (params.id) fetchTournamentTeams();
  }, [params.id]);

  const fetchTournamentTeams = async () => {
    try {
      setLoading(true);
      setError("");
      const [tournamentData, teamsData] = await Promise.all([
        tournamentApi.getTournament(params.id as string), // GET /api/tournaments/:id
        teamsApi.getTournamentTeams(params.id as string), // GET /api/teams/tournament/:id
      ]);

      setTournament(tournamentData);
      setTeams(teamsData);
      // Set default sport from tournament
      setNewTeam((prev) => ({ ...prev, sport: tournamentData.sport }));
    } catch (error: unknown) {
      console.error("Failed to fetch tournament teams:", error);
      setError("Failed to load tournament teams. Please try again.");
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
        sport: newTeam.sport,
      });
      setShowCreateTeam(false);
      setNewTeam({
        name: "",
        sport: tournament?.sport || "football",
      });
      await fetchTournamentTeams();
    } catch (error: unknown) {
      console.error("Failed to create team:", error);
      setError("Failed to create team. Check tournament availability.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <LoadingSpinner size="xl" message="Loading tournament teams..." />;

  if (!tournament) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">Tournament not found</div>
        <Link href="/tournaments" className="text-indigo-600 hover:underline">
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

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
            className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
          >
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              {tournament.sport.toUpperCase()}
            </span>
            <span>
              {teams.length}/{tournament.maxTeams} teams
            </span>
          </div>
        </div>
        {tournament.status === "registration" && (
          <button
            onClick={() => setShowCreateTeam(true)}
            disabled={updating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Creating..." : "Create Team"}
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8">Teams ({teams.length})</h2>
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
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  View Team →
                </Link>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {team.sport.toUpperCase()}
                  </span>
                  <span>{team.players?.length || 0} players</span>
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
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <input
                type="text"
                placeholder="Team Name (e.g. FC Galaxy)"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                required
                disabled={updating}
              />
              <select
                value={newTeam.sport}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, sport: e.target.value as string })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={updating}
              >
                <option value="football">Football</option>
                <option value="volleyball">Volleyball</option>
                <option value="basketball">Basketball</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Creating..." : "Create Team"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  disabled={updating}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
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
