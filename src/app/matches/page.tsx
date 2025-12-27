"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match } from "@/types/api";
import { MatchStatus } from "@/enums/enums";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState({
    tournamentId: "",
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
    round: "",
    status: MatchStatus.SCHEDULED,
  });
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch teams");
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });
      setShowCreateModal(false);
      setNewMatch({
        tournamentId: "",
        homeTeamId: "",
        awayTeamId: "",
        scheduledAt: "",
        round: "",
        status: MatchStatus.SCHEDULED,
      });
      fetchMatches();
    } catch (error) {
      console.error("Failed to create match");
    }
  };

  const handleUpdateScore = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    try {
      await fetch(`/api/matches/${matchId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore, awayScore }),
      });
      fetchMatches();
    } catch (error) {
      console.error("Failed to update score");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading matches...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/tournaments"
            className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Matches</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Match
        </button>
      </div>

      {/* Matches Grid */}
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
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                Set Result
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
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <select
                value={newMatch.tournamentId}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, tournamentId: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Tournament</option>
                {/* Populate from API */}
              </select>
              <select
                value={newMatch.homeTeamId}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, homeTeamId: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Home Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={newMatch.awayTeamId}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, awayTeamId: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Away Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newMatch.scheduledAt}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, scheduledAt: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
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
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                  Create Match
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300"
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
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingMatch.homeTeam.name}
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-20 p-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                  defaultValue={editingMatch.homeScore ?? ""}
                  id="homeScore"
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
                  className="w-20 p-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                  defaultValue={editingMatch.awayScore ?? ""}
                  id="awayScore"
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
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                Save Result
              </button>
              <button
                onClick={() => setEditingMatch(null)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
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
