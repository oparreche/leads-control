"use client";

import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novos",
  EM_ATENDIMENTO: "Em Atendimento",
  CONTATO_REALIZADO: "Contato Realizado",
  INTERESSADO: "Interessados",
  NAO_INTERESSADO: "Não Interessados",
  FECHADO_GANHO: "Fechado (Ganho)",
  FECHADO_PERDIDO: "Fechado (Perdido)",
};

const STATUS_COLORS: Record<string, string> = {
  NOVO: "bg-blue-100 text-blue-800",
  EM_ATENDIMENTO: "bg-yellow-100 text-yellow-800",
  CONTATO_REALIZADO: "bg-purple-100 text-purple-800",
  INTERESSADO: "bg-green-100 text-green-800",
  NAO_INTERESSADO: "bg-gray-100 text-gray-800",
  FECHADO_GANHO: "bg-emerald-100 text-emerald-800",
  FECHADO_PERDIDO: "bg-red-100 text-red-800",
};

interface StatsData {
  stats: { status: string; _count: { status: number } }[];
  total: number;
}

export default function StatsCards({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/leads/stats")
      .then((r) => r.json())
      .then(setData);
  }, [refreshKey]);

  if (!data) return null;

  const statsMap = Object.fromEntries(
    data.stats.map((s) => [s.status, s._count.status])
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-2xl font-bold text-gray-800">{data.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-gray-800">
              {statsMap[key] || 0}
            </p>
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${STATUS_COLORS[key]}`}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
