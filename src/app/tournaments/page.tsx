"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tournament } from "@/types/api";
import { Sport, TournamentStatus } from "@/enums/enums";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { tournamentApi, getErrorMessage } from "@/lib/api"; // ✅ API + Error hook
import { toast } from "react-toastify";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ✅ Error state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false); // ✅ Create loading
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
      toast.success("Tournaments got Successfully");
    } catch (error: unknown) {
      // ✅ ESLint safe error handling
      // console.error("Failed to fetch tournaments:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // ✅ Uses your typed API
      await tournamentApi.createTournament(newTournament);
      setShowCreateModal(false);
      setNewTournament({
        name: "",
        sport: Sport.FOOTBALL,
        maxTeams: 16,
        startDate: "",
        endDate: "",
      });
      fetchTournaments();
      toast.success("Tournament created Successfully");
    } catch (error: unknown) {
      // ✅ Perfect error UX
      // console.error("Failed to create tournament:", error);
      // alert(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status as TournamentStatus) {
      case TournamentStatus.REGISTRATION:
        return "bg-green-100 text-green-800";
      case TournamentStatus.ONGOING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" message="Loading tournaments..." />;
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Failed to load tournaments
          </h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={fetchTournaments}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          disabled={creating}
        >
          Create Tournament
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tournament.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Starts: {new Date(tournament.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {tournament.currentTeams}/{tournament.maxTeams} teams
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                tournament.status
              )}`}
            >
              {tournament.status.toUpperCase()}
            </span>
            <button
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Tournament</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) =>
                  setNewTournament({ ...newTournament, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
                disabled={creating}
              />
              <select
                value={newTournament.sport}
                onChange={(e) =>
                  setNewTournament({
                    ...newTournament,
                    sport: e.target.value as Sport,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={creating}
              >
                <option value={Sport.FOOTBALL}>Football</option>
                <option value={Sport.VOLLEYBALL}>Volleyball</option>
                <option value={Sport.BASKETBALL}>Basketball</option>
              </select>
              <input
                type="date"
                value={newTournament.startDate}
                onChange={(e) =>
                  setNewTournament({
                    ...newTournament,
                    startDate: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
                disabled={creating}
              />
              <input
                type="date"
                value={newTournament.endDate}
                onChange={(e) =>
                  setNewTournament({
                    ...newTournament,
                    endDate: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
                disabled={creating}
              />
              <input
                type="number"
                placeholder="Max Teams (e.g. 16)"
                value={newTournament.maxTeams}
                onChange={(e) =>
                  setNewTournament({
                    ...newTournament,
                    maxTeams: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="2"
                max="128"
                required
                disabled={creating}
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <LoadingSpinner size="sm" /> : null}
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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
