"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Player, Team } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { CreateEditModal } from "@/components/CreateEditModal";
import { FormInput } from "@/components/FormInput";
import { teamsApi, playersApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Select } from "@/components/Select";
import { sportPositionsMap } from "@/enums/enums";

export default function TeamDetail() {
  const t = useTranslations("teams.detail");
  const params = useParams();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    jerseyNumber: "",
    isCaptain: false,
  });
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    if (params.teamId) fetchTeam();
  }, [params.teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await teamsApi.getTeam(params.teamId as string);
      setTeam(data);
      setPlayers(data.players || []);
      setPositions(sportPositionsMap[data.sport] || []);
    } catch (error: unknown) {
      setError(t("errors.loadTeam"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      await playersApi.addPlayer({
        teamId: params.teamId as string,
        ...newPlayer,
      });
      setShowAddPlayer(false);
      setNewPlayer({
        name: "",
        position: "",
        jerseyNumber: "",
        isCaptain: false,
      });
      await fetchTeam();
    } catch (error: unknown) {
      setError(t("errors.addPlayer"));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm(t("confirmDeletePlayer"))) return;

    setUpdating(true);
    setError("");

    try {
      await playersApi.deletePlayer(params.teamId as string, playerId);
      await fetchTeam();
    } catch (error: unknown) {
      setError(t("errors.deletePlayer"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner size="xl" message={t("loading")} />;

  if (!team) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">{t("notFound")}</div>
        <Link href="/tournaments" className="text-indigo-600 hover:underline">
          ← {t("backToTournaments")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <ErrorBanner error={error} onClear={() => setError('')} />

      <div className="flex justify-between items-start">
        <div>
          <Link
            href={`/tournaments/${team.tournament.id}/teams`}
            className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block"
          >
            ← {t("backToTeams")}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.name}</h1>
          <div className="flex gap-4 text-sm text-gray-500 items-center">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium capitalize">
              {team.sport}
            </span>
            {team.tournament && (
              <Link
                href={`/tournaments/${team.tournament.id}`}
                className="hover:underline"
              >
                {team.tournament.name}
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          disabled={updating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
        >
          {updating ? t("adding") : t("addPlayer")}
        </button>
      </div>

      {/* Players Table */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {t("rosterTitle", { count: players.length })}
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  {t("jersey")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("name")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("position")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("captain")}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.length > 0 ? (
                players.map((player, index) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.jerseyNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.isCaptain ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          ⭐ {t("captainLabel")}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        disabled={updating}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {updating ? t("removing") : t("remove")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {t("noPlayers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Player Modal */}
      <CreateEditModal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        title={t("addModal.title")}
        onSubmit={handleAddPlayer}
        updating={updating}
        submitText={t("addPlayer")}
      >
        <FormInput
          label={t("addModal.name")}
          id="name"
          value={newPlayer.name}
          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          required
          disabled={updating}
        />

        <Select
          label={t("addModal.position")}
          id="position"
          value={newPlayer.position}
          onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
          options={positions.map(pos => ({
            value: pos,
            label: t(`positions.${pos}`) || pos
          }))}
          disabled={updating}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label={t("addModal.jersey")}
            id="jersey"
            type="number"
            value={newPlayer.jerseyNumber}
            onChange={(e) =>
              setNewPlayer({
                ...newPlayer,
                jerseyNumber: e.target.value,
              })
            }
            disabled={updating}
          />

          <div className="flex items-center pt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newPlayer.isCaptain}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    isCaptain: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                disabled={updating}
              />
              {t("addModal.captain")}
            </label>
          </div>
        </div>
      </CreateEditModal>
    </div>
  );
}
