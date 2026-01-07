"use client";

import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types/api";
import { useTranslations } from "next-intl";
import { StatusBadge } from "../StatusBadge";

interface TournamentCardProps extends PropsWithChildren {
  tournament: Tournament;
  onViewDetails?: () => void;
}

export default function TournamentCard({
  tournament,
  onViewDetails,
  ...props
}: TournamentCardProps) {
  const t = useTranslations("tournaments.list");
  const router = useRouter();

  const handleViewDetails = () => {
    onViewDetails?.();
    router.push(`/tournaments/${tournament.id}`);
  };

  const startDate = new Date(tournament.startDate).toLocaleDateString();
  const progress = Math.round(
    (tournament.currentTeams / tournament.maxTeams) * 100
  );

  return (
    <div
      {...props}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-8"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {tournament.name}
          </h3>
          <StatusBadge status={tournament.status} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <span className="w-4 h-4 bg-indigo-500 rounded-full"></span>
            {t("starts", { date: startDate })}
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <span className="font-semibold text-gray-900">
              {tournament.currentTeams}/{tournament.maxTeams} {t("teams")}
            </span>
            <span className="text-sm font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleViewDetails}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl text-sm font-semibold shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {t("viewDetails")}
      </button>
    </div>
  );
}
