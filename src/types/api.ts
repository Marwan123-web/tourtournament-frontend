// Backend DTOs + Responses (Exact types)
export interface CreateTournamentDto {
    name: string;
    sport: 'football' | 'volleyball' | 'basketball';
    maxTeams: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
  }
  
  export interface Tournament {
    id: string;
    name: string;
    sport: 'football' | 'volleyball' | 'basketball';
    maxTeams: number;
    startDate: string;
    endDate: string;
    status: 'registration' | 'ongoing' | 'finished' | 'cancelled';
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
    sport: 'football' | 'volleyball' | 'basketball';
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