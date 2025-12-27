'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tournament } from '@/types/api';



export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    sport: 'football' as 'football' | 'volleyball' | 'basketball',
    maxTeams: 16,
    startDate: '',
    endDate: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      setTournaments(data);
    } catch (error) {
      console.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament),
      });
      setShowCreateModal(false);
      fetchTournaments();
    } catch (error) {
      console.error('Failed to create tournament');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tournaments...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Tournament
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{tournament.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Starts: {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500 mb-4">{tournament.currentTeams}/{tournament.maxTeams || '?'} teams</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              tournament.status === 'registration' ? 'bg-green-100 text-green-800' :
              tournament.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
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
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="date"
                value={newTournament.startDate}
                onChange={(e) => setNewTournament({...newTournament, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Max Teams (e.g. 16)"
                value={newTournament.maxTeams}
                onChange={(e) => setNewTournament({...newTournament, maxTeams: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                  Create
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
    </div>
  );
}
