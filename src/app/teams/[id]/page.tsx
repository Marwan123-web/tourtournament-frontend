'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Player, Team, Tournament } from '@/types/api';



export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
    isCaptain: false
  });

  useEffect(() => {
    if (params.id) fetchTeam();
  }, [params.id]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${params.id}?include=players`);
      const data = await res.json();
      setTeam(data.team);
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Failed to fetch team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/teams/${params.id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });
      setShowAddPlayer(false);
      setNewPlayer({ name: '', position: '', jerseyNumber: '', isCaptain: false });
      fetchTeam();
    } catch (error) {
      console.error('Failed to add player');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Remove this player?')) return;
    try {
      await fetch(`/api/teams/${params.id}/players/${playerId}`, {
        method: 'DELETE',
      });
      fetchTeam();
    } catch (error) {
      console.error('Failed to delete player');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading team...</div>;
  if (!team) return <div className="p-8 text-center">Team not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link href="/tournaments" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.name}</h1>
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              {team.sport.toUpperCase()}
            </span>
            {team.tournament && (
              <Link href={`/tournaments/${team.tournament.id}`} className="hover:underline">
                {team.tournament.name}
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          Add Player
        </button>
      </div>

      {/* Players Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Roster ({players.length} players)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.jerseyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.isCaptain ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">⭐ Captain</span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  placeholder="Forward / Midfielder"
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jersey #</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="10"
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer({...newPlayer, jerseyNumber: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newPlayer.isCaptain}
                      onChange={(e) => setNewPlayer({...newPlayer, isCaptain: e.target.checked})}
                      className="rounded"
                    />
                    Captain
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-medium">
                  Add Player
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
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
