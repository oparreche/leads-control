"use client";

import { useEffect, useState, useCallback } from "react";
import LeadModal from "./LeadModal";

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo",
  EM_ATENDIMENTO: "Em Atendimento",
  CONTATO_REALIZADO: "Contato Realizado",
  INTERESSADO: "Interessado",
  NAO_INTERESSADO: "Não Interessado",
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

interface Lead {
  id: number;
  nome: string;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  telefone1: string | null;
  email: string | null;
  status: string;
  interactions: {
    user: { name: string };
    action: string;
    createdAt: string;
  }[];
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function LeadsTable({ onUpdate }: { onUpdate: () => void }) {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function handleLeadUpdated() {
    fetchLeads();
    onUpdate();
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou cidade..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">Nome</th>
              <th className="text-left p-3 font-medium text-gray-600">Telefone</th>
              <th className="text-left p-3 font-medium text-gray-600">Cidade</th>
              <th className="text-left p-3 font-medium text-gray-600">Status</th>
              <th className="text-left p-3 font-medium text-gray-600">Atendido por</th>
              <th className="text-left p-3 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : data?.leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : (
              data?.leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <td className="p-3 text-gray-900 font-medium">{lead.nome}</td>
                  <td className="p-3 text-gray-600">{lead.telefone1 || "-"}</td>
                  <td className="p-3 text-gray-600">
                    {lead.cidade ? `${lead.cidade}/${lead.uf}` : "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 text-xs">
                    {lead.interactions[0]
                      ? lead.interactions[0].user.name
                      : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLeadId(lead.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando página {data.currentPage} de {data.pages} ({data.total}{" "}
            leads)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-700"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-700"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {selectedLeadId && (
        <LeadModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={handleLeadUpdated}
        />
      )}
    </div>
  );
}
