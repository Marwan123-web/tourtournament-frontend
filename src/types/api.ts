import { MatchStatus, Sport, TournamentStatus } from "@/enums/enums";

export interface CreateTournamentDto {
  name: string;
  sport: Sport;
  maxTeams: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface Tournament {
  id: string;
  name: string;
  sport: Sport;
  maxTeams: number;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  currentTeams: number;
  isActive: boolean;
  creator: {
    id: number;
    email: string;
  };
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  tournament: Tournament;
  players: Player[];
}

export interface TeamStanding {
  position: number;
  team: {
    id: string;
    name: string;
  };
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface User {
  id: number;
  email?: string;
  username?: string;
  name: string;
  surname: string;
  role: SystemRoles;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number | null;
  isCaptain: boolean;
}

export interface NewPlayer {
  name: string;
  position: string;
  jerseyNumber: number | null;
  isCaptain: boolean;
  // teamId: string;
}

export interface Field {
  id: string;
  name: string;
  sport: Sport;
  capacity: number;
  address: string;
  pricePerHour: number;
  isAvailable: boolean;
  bookings: Booking[];
}

export interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  fieldId?: string;
  field: Field;
  userId?: number;
  user: User;
  status?: string;
  tournamentId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string;
  status: MatchStatus;
  round: string;
}

export interface ApiError {
  statusCode: number;
  message: {
    error: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
  path: string;
}

export enum SystemRoles {
  ADMIN = "admin",
  USER = "user",
}

export interface NextIntlRequestConfig {
  messages: Record<string, string | Record<string, unknown>>;
  locale: string;
  timeZone?: string;
  now?: Date;
}

export interface Slot {
  time: string;
  available: boolean;
  status: 'available' | 'booked' | 'past';
}
