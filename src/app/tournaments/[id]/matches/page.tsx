"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Match } from "@/types/api";
import { MatchStatus } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { matchesApi, teamsApi } from "@/lib/api";

export default function TournamentMatchesPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
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
      console.error("Failed to fetch tournament matches:", error);
      setError("Failed to load matches. Please try again.");
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
      setError(
        "Failed to create match. Please check your input and try again."
      );
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
      setError("Failed to update score. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <LoadingSpinner size="xl" message="Loading tournament matches..." />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href={`/tournaments/${tournamentId}`}
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← Back to Tournament
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Tournament Matches
            </h1>
            <p className="text-gray-500 text-lg">{tournamentId}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {updating ? "Creating..." : "Create Match"}
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
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  match.status === MatchStatus.SCHEDULED
                    ? "bg-blue-100 text-blue-800"
                    : match.status === MatchStatus.LIVE
                    ? "bg-green-100 text-green-800"
                    : match.status === MatchStatus.FINISHED
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {match.status.toUpperCase()}
              </span>
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
                <div className="w-12 h-1 bg-gray-300 rounded-full">
                  {match.homeScore !== null && match.awayScore !== null && (
                    <div
                      className="h-1 bg-indigo-600 rounded-full transition-all duration-300"
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

            {match.status === "scheduled" && (
              <button
                onClick={() => setEditingMatch(match)}
                disabled={updating}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 text-sm font-medium disabled:opacity-50"
              >
                {updating ? "Updating..." : "Set Result"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Match Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Match</h2>
            <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm font-medium text-indigo-800">
                Tournament: <span className="font-bold">{tournamentId}</span>
              </p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <select
                value={newMatch.team1Id}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, team1Id: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              >
                <option value="">Home Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={newMatch.team2Id}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, team2Id: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              >
                <option value="">Away Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {/* <input
                type="datetime-local"
                value={newMatch.scheduledAt}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, scheduledAt: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              />
              <input
                type="text"
                placeholder="Round (e.g. Quarterfinals)"
                value={newMatch.round}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, round: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
                disabled={updating}
              /> */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? "Creating..." : "Create Match"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={updating}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Score Modal */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingMatch.homeTeam.name} vs {editingMatch.awayTeam.name}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingMatch.homeTeam.name}
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={editingMatch.homeScore ?? ""}
                  id="homeScore"
                  disabled={updating}
                  className="w-20 p-3 border border-gray-300 rounded-lg text-center text-2xl font-bold disabled:opacity-50"
                />
              </div>
              <span className="text-2xl font-bold text-gray-400">VS</span>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingMatch.awayTeam.name}
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={editingMatch.awayScore ?? ""}
                  id="awayScore"
                  disabled={updating}
                  className="w-20 p-3 border border-gray-300 rounded-lg text-center text-2xl font-bold disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const homeScore = (
                    document.getElementById("homeScore") as HTMLInputElement
                  ).valueAsNumber;
                  const awayScore = (
                    document.getElementById("awayScore") as HTMLInputElement
                  ).valueAsNumber;
                  handleUpdateScore(editingMatch.id, homeScore, awayScore);
                }}
                disabled={updating}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Result"}
              </button>
              <button
                onClick={() => setEditingMatch(null)}
                disabled={updating}
                className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
