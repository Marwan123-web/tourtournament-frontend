import axios from 'axios';
import type { 
  CreateTournamentDto, 
  Tournament, 
  Team, 
  TeamStanding,
  User 
} from '@/types/api';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tournamentApi = {
  // Tournaments
  getTournaments: () => api.get<Tournament[]>('/tournaments').then(res => res.data),
  createTournament: (data: CreateTournamentDto) => api.post<Tournament>('/tournaments', data).then(res => res.data),
  getTournament: (id: string) => api.get<Tournament>(`/tournaments/${id}`).then(res => res.data),
  
  // Teams
  getTeamsByTournament: (tournamentId: string) => api.get<Team[]>(`/teams/tournament/${tournamentId}`).then(res => res.data),
  
  // Standings
  getStandings: (tournamentId: string) => api.get<TeamStanding[]>(`/standings/tournament/${tournamentId}`).then(res => res.data),
};

export const authApi = {
  signup: (email: string, password: string, username: string) => 
    api.post<{ access_token: string; user: User }>('/api/auth/signup', { email, password, username }).then(res => res.data),
  
  login: (email: string, password: string) => 
    api.post<{ access_token: string; user: User }>('/api/auth/signin', { email, password }).then(res => res.data),
    
  whoami: () => api.get<User>('/api/auth/whoami').then(res => res.data),
};

export default api;
