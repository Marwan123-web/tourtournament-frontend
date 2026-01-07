'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { Team } from '@/types/api';
import { useTranslations } from 'next-intl';

interface TeamCardProps extends PropsWithChildren {
  team: Team;
  href?: string;
}

export default function TeamCard({ team, href = `/teams/${team.id}`, ...props }: TeamCardProps) {
  const t = useTranslations("tournaments.teams");
  const playerCount = team.players?.length || 0;

  return (
    <div
      {...props}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-8 transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-8">
        <h3 className="text-3xl font-bold text-gray-900 leading-tight">
          {team.name}
        </h3>
        <Link
          href={href}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t("viewTeam")}
        </Link>
      </div>
      
      <div className="flex items-center justify-center sm:justify-start gap-6 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <span className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-sm">
            👥
          </span>
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{playerCount}</div>
            <div className="text-sm font-medium text-gray-600">{t("players")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
