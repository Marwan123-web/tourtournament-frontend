interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles = {
  available: "bg-green-100 text-green-800",
  booked: "bg-red-100 text-red-800",
  admin: "bg-indigo-100 text-indigo-800",
  user: "bg-gray-100 text-gray-800",
  captain: "bg-yellow-100 text-yellow-800",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const base = "px-3 py-1 rounded-full text-xs font-medium capitalize";
  const style =
    statusStyles[status.toLowerCase() as keyof typeof statusStyles] ||
    "bg-gray-100 text-gray-800";
  return <span className={`${base} ${style} ${className}`}>{status}</span>;
}
