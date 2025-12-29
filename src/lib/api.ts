import axios, { AxiosError } from "axios";
import type {
  CreateTournamentDto,
  Tournament,
  Team,
  TeamStanding,
  User,
  ApiError,
} from "@/types/api";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Global error handler - NO 'any' types!
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
};

export default api;
