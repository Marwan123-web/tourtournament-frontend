"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import { Team } from "@/types/api";
import { useTranslations } from "next-intl";

interface TeamCardProps extends PropsWithChildren {
  team: Team;
  href?: string;
}

export default function TeamCard({
  team,
  href = `/teams/${team.id}`,
  ...props
}: TeamCardProps) {
  const t = useTranslations("tournaments.teams");
  const playerCount = team.players?.length || 0;

  return (
    <div
      {...props}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-8 flex flex-col gap-6 justify-between"
    >
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-gray-900 leading-tight">
          {team.name}
        </h3>
        <div className="h-px w-24 bg-gradient-to-r from-indigo-500 to-transparent"></div>
      </div>

      {/* Player Stats - Prominent Badge */}
      <div className="flex items-center justify-center sm:justify-start p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <span className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-3xl shadow-lg border-4 border-white ring-8 ring-indigo-50/50">
              👥
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {playerCount}
            </div>
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {t("players")}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Link
          href={href}
          className="w-full block bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-8 rounded-xl text-sm font-bold uppercase tracking-wide shadow-lg hover:shadow-xl border border-transparent focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 text-center"
        >
          {t("viewTeam")}
        </Link>
      </div>
    </div>
  );
}
