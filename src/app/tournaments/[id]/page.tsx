"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Tournament, TeamStanding, Team } from "@/types/api";
import { TournamentStatus } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { tournamentApi, teamsApi, getErrorMessage } from "@/lib/api";

export default function TournamentDetail() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
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
      // Set default sport from tournament
      setNewTeam((prev) => ({ ...prev, sport: tournamentData.sport }));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // const handleJoinTeam = async (teamId: string) => {
  //   setUpdating(true);
  //   setError("");

  //   try {
  //     await tournamentApi.joinTeam(params.id as string, teamId);
  //     fetchTournament(); // Refresh data
  //   } catch (error: unknown) {
  //     setError(getErrorMessage(error));
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

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
      setNewTeam({ name: "", sport: tournament?.sport || "football" });
      fetchTournament(); // Refresh teams list
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" message="Loading tournament..." />;
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={fetchTournament}
            disabled={updating}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? "Loading..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tournament not found
          </h2>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{tournament.sport.toUpperCase()}</span>
            <span>
              {tournament.currentTeams}/{tournament.maxTeams} teams
            </span>
            <span>
              Status:{" "}
              <span
                className={`capitalize font-medium ${getStatusColor(
                  tournament.status
                )}`}
              >
                {tournament.status}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-2xl font-bold text-gray-900">
            {tournament.startDate} - {tournament.endDate}
          </p>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              tournament.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {tournament.isActive ? "Active" : "Inactive"}
          </span>
          {tournament.status === TournamentStatus.REGISTRATION && (
            <button
              onClick={() => setShowCreateTeam(true)}
              disabled={updating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Creating..." : "Create New Team"}
            </button>
          )}
        </div>
      </div>

      {/* Standings Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Standings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  W
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  D
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  L
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GD
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pts
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.team.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {standing.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {standing.team.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.wins + standing.draws + standing.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.wins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.draws}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.goalDifference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {standing.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Teams List */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          Teams ({teams.length}/{tournament.maxTeams})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {team.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {team.sport.toUpperCase()}
              </p>
              <button
                // onClick={() => handleJoinTeam(team.id)}
                disabled={updating}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Joining..." : "Join Team"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              Create Team for {tournament.name}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <input
                type="text"
                placeholder="Team Name (e.g. FC Barcelona)"
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
                  setNewTeam({ ...newTeam, sport: e.target.value })
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

function getStatusColor(status: string) {
  switch (status) {
    case TournamentStatus.REGISTRATION:
      return "text-green-600";
    case TournamentStatus.ONGOING:
      return "text-yellow-600";
    case TournamentStatus.FINISHED:
      return "text-gray-600";
    case TournamentStatus.CANCELLED:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}
