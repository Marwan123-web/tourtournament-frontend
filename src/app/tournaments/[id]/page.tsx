'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Tournament, TeamStanding, Team } from '@/types/api';

export default function TournamentDetail() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchTournament();
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${params.id}`);
      const data = await res.json();
      setTournament(data.tournament);
      setStandings(data.standings);
      setTeams(data.teams);
    } catch (error) {
      console.error('Failed to fetch tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await fetch(`/api/tournaments/${params.id}/join-team/${teamId}`, {
        method: 'POST',
      });
      fetchTournament(); // Refresh data
    } catch (error) {
      console.error('Failed to join team');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tournament...</div>;
  if (!tournament) return <div className="p-8 text-center">Tournament not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link href="/tournaments" className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block">
            ← Back to Tournaments
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{tournament.sport.toUpperCase()}</span>
            <span>{tournament.currentTeams}/{tournament.maxTeams} teams</span>
            <span>Status: <span className={`capitalize font-medium ${getStatusColor(tournament.status)}`}>
              {tournament.status}
            </span></span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{tournament.startDate} - {tournament.endDate}</p>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${tournament.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {tournament.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Standings Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Standings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr key={standing.team.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{standing.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{standing.team.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {standing.wins + standing.draws + standing.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{standing.wins}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{standing.draws}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{standing.losses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{standing.goalDifference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Teams List */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Teams ({teams.length}/{tournament.maxTeams})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{team.sport.toUpperCase()}</p>
              <button
                onClick={() => handleJoinTeam(team.id)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                Join Team
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'registration': return 'text-green-600';
    case 'ongoing': return 'text-yellow-600';
    case 'finished': return 'text-gray-600';
    case 'cancelled': return 'text-red-600';
    default: return 'text-gray-600';
  }
}
