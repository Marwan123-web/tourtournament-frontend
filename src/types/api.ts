import {
  BookingStatus,
  MatchStatus,
  Sport,
  TournamentStatus,
} from "@/enums/enums";

// Backend DTOs + Responses (Exact types)
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
  email: string;
  username?: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  isCaptain: boolean;
}

export interface Field {
  id: string;
  name: string;
  sport: Sport;
  capacity: number;
  location: string;
  pricePerHour: number;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  fieldId: string;
  field: Field;
  userId: number;
  startTime: string;
  endTime: string;
  tournamentId?: string;
  status: BookingStatus;
  createdAt: string;
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
