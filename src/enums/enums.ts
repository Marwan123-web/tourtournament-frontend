export enum Sport {
  FOOTBALL = "football",
  VOLLEYBALL = "volleyball",
  BASKETBALL = "basketball",
}
export enum MatchStatus {
  SCHEDULED = "scheduled",
  LIVE = "live",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export enum TournamentStatus {
  REGISTRATION = "registration",
  ONGOING = "ongoing",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}


export enum FootballPosition {
  GOALKEEPER = 'goalkeeper',
  CENTER_BACK = 'center_back',
  RIGHT_BACK = 'right_back',
  LEFT_BACK = 'left_back',
  DEFENSIVE_MIDFIELDER = 'defensive_midfielder',
  CENTRAL_MIDFIELDER = 'central_midfielder',
  ATTACKING_MIDFIELDER = 'attacking_midfielder',
  RIGHT_WINGER = 'right_winger',
  LEFT_WINGER = 'left_winger',
  STRIKER = 'striker'
}

export enum BasketballPosition {
  POINT_GUARD = 'point_guard',
  SHOOTING_GUARD = 'shooting_guard',
  SMALL_FORWARD = 'small_forward',
  POWER_FORWARD = 'power_forward',
  CENTER = 'center'
}


export enum VolleyballPosition {
  SETTER = 'setter',
  OUTSIDE_HITTER = 'outside_hitter',
  OPPOSITE_HITTER = 'opposite_hitter',
  MIDDLE_BLOCKER = 'middle_blocker',
  LIBERO = 'libero',
  DEFENSIVE_SPECIALIST = 'defensive_specialist'
}

export const sportPositionsMap: Record<string, string[]> = {
  football: Object.values(FootballPosition),
  basketball: Object.values(BasketballPosition),
  volleyball: Object.values(VolleyballPosition),
};