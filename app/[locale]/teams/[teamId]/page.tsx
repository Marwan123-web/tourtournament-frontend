"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Player, Team, Tournament } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { teamsApi, playersApi } from "@/lib/api";

export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    jerseyNumber: "",
    isCaptain: false,
  });

  useEffect(() => {
    if (params.teamId) fetchTeam();
  }, [params.teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await teamsApi.getTeam(params.teamId as string);
      setTeam(data);
      setPlayers(data.players || []);
    } catch (error: unknown) {
      console.error("Failed to fetch team:", error);
      setError("Failed to load team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await playersApi.addPlayer({
        teamId: params.teamId as string,
        ...newPlayer,
      });
      setShowAddPlayer(false);
      setNewPlayer({
        name: "",
        position: "",
        jerseyNumber: "",
        isCaptain: false,
      });
      await fetchTeam();
    } catch (error: unknown) {
      console.error("Failed to add player:", error);
      setError("Failed to add player. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Remove this player?")) return;

    setUpdating(true);
    setError("");

    try {
      await playersApi.deletePlayer(params.teamId as string, playerId);
      await fetchTeam();
    } catch (error: unknown) {
      console.error("Failed to delete player:", error);
      setError("Failed to remove player. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message="Loading team..." />;

  if (!team) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">Team not found</div>
        <Link
          href={`/tournaments`}
          className="text-indigo-600 hover:underline"
        >
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

      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href={`/tournaments/${team.tournament.id}/teams`}
            className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
          >
            ← Back to Teams
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.name}</h1>
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              {team.sport.toUpperCase()}
            </span>
            {team.tournament && (
              <Link
                href={`/tournaments/${team.tournament.id}`}
                className="hover:underline"
              >
                {team.tournament.name}
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Adding..." : "Add Player"}
        </button>
      </div>

      {/* Players Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Roster ({players.length} players)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Captain
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.length > 0 ? (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.jerseyNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.isCaptain ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          ⭐ Captain
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        disabled={updating}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No players yet. Add the first player to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Player</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  required
                  disabled={updating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  placeholder="Forward / Midfielder / Defender"
                  value={newPlayer.position}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, position: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  required
                  disabled={updating}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jersey #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="10"
                    value={newPlayer.jerseyNumber}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        jerseyNumber: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={updating}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={newPlayer.isCaptain}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          isCaptain: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      disabled={updating}
                    />
                    Captain
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Adding..." : "Add Player"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(false)}
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
