type TournamentStatus = "registration" | "ongoing" | "finished" | "cancelled";
type FieldStatus = "available" | "booked" | "admin" | "user";
type MatchStatus = "scheduled" | "live" | "finished" | "cancelled";
type UserStatus = "active" | "inactive";

type AllStatuses = TournamentStatus | FieldStatus | MatchStatus | UserStatus;

interface StatusBadgeProps {
  status: AllStatuses;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusStyles: Record<AllStatuses, string> = {
  // Tournament
  registration: "bg-green-100 text-green-800 border border-green-200",
  ongoing: "bg-blue-100 text-blue-800 border border-blue-200",
  finished: "bg-gray-200 text-gray-800 border border-gray-300",
  cancelled: "bg-red-100 text-red-800 border border-red-200",

  // Field
  available: "bg-green-100 text-green-800 border border-green-200",
  booked: "bg-red-100 text-red-800 border border-red-200",
  admin: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  user: "bg-blue-100 text-blue-800 border border-blue-200",

  // Match
  scheduled: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  live: "bg-emerald-100 text-emerald-800 border border-emerald-200",

  // User
  active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  inactive: "bg-orange-100 text-orange-800 border border-orange-200",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function StatusBadge({
  status,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const base =
    "inline-flex items-center rounded-full font-semibold capitalize border font-medium shadow-sm";
  const sizeClass = sizeStyles[size];

  return (
    <span
      className={`${base} ${sizeClass} ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
