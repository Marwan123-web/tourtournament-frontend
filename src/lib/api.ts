import axios, { AxiosError } from "axios";
import type {
  CreateTournamentDto,
  Tournament,
  Team,
  TeamStanding,
  User,
  ApiError,
  Field,
  Booking,
  Match,
} from "@/types/api";
import { toast } from "react-toastify";
import { Sport } from "@/enums/enums";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // console.error("API Error:", {
    //   message: error.response?.data?.message || error.message,
    //   status: error.response?.status,
    //   path: error.response?.data?.path,
    // });
    toast.error(error.response?.data?.message?.message);
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message?.message || error.message || "Server error"
    );
  }
  return "Network error. Please try again.";
};

export const tournamentApi = {
  // Tournaments
  getTournaments: () =>
    api.get<Tournament[]>("api/tournaments").then((res) => res.data),
  createTournament: (data: CreateTournamentDto) =>
    api.post<Tournament>("api/tournaments", data).then((res) => res.data),
  getTournament: (id: string) =>
    api.get<Tournament>(`api/tournaments/${id}`).then((res) => res.data),

  // Teams
  getTeamsByTournament: (tournamentId: string) =>
    api
      .get<Team[]>(`api/teams/tournament/${tournamentId}`)
      .then((res) => res.data),

  // Standings
  getStandings: (tournamentId: string) =>
    api
      .get<TeamStanding[]>(`api/standings/tournament/${tournamentId}`)
      .then((res) => res.data),
};

export const authApi = {
  signup: (email: string, password: string, username: string) =>
    api
      .post<{ access_token: string; user: User }>("/api/auth/signup", {
        email,
        password,
        username,
      })
      .then((res) => res.data),

  login: (email: string, password: string) =>
    api
      .post<{ access_token: string; user: User }>("/api/auth/signin", {
        email,
        password,
      })
      .then((res) => res.data),

  whoami: () => api.get<User>("/api/auth/whoami").then((res) => res.data),
  updateProfile: (data: { username: string; email: string }) =>
    api.put<User>("/api/auth/update", data).then((res) => res.data),
};

export const fieldsApi = {
  getFields: () => api.get<Field[]>("/api/fields").then((res) => res.data),

  createField: (data: {
    name: string;
    sport: Sport;
    capacity: number;
    address: string;
    pricePerHour: number;
  }) => api.post<Field>("/api/fields", data).then((res) => res.data),
};

export const bookingsApi = {
  getBookings: () =>
    api.get<Booking[]>("/api/bookings").then((res) => res.data),

  createBooking: (data: {
    fieldId: string;
    startTime: string;
    endTime: string;
  }) => api.post<Booking>("/api/bookings", data).then((res) => res.data),
};

export const matchesApi = {
  getMatches: () => api.get<Match[]>("/api/matches").then((res) => res.data),

  // ✅ ADD THIS NEW METHOD:
  getTournamentMatches: (tournamentId: string) =>
    api
      .get<Match[]>(`/api/matches/tournament/${tournamentId}`)
      .then((res) => res.data),

  createMatch: (data: {
    tournamentId: string;
    team1Id: string;
    team2Id: string;
    scheduledAt: string;
    round: string;
    status: string;
  }) => api.post<Match>("/api/matches", data).then((res) => res.data),

  updateScore: (
    matchId: string,
    data: { homeScore: number; awayScore: number }
  ) =>
    api
      .patch<Match>(`/api/matches/${matchId}/results`, data)
      .then((res) => res.data),
};

export const teamsApi = {
  getTournamentTeams: (tournamentId: string) =>
    api
      .get<Team[]>(`/api/teams/tournament/${tournamentId}`)
      .then((res) => res.data),
};
export default api;
