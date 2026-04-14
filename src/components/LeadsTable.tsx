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

function formatWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }
  return null;
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
                    <div className="flex items-center gap-2">
                      {lead.telefone1 && formatWhatsAppNumber(lead.telefone1) && (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(lead.telefone1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadId(lead.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Detalhes
                      </button>
                    </div>
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
