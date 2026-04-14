"use client";

import { useEffect, useState } from "react";

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

interface Interaction {
  id: number;
  action: string;
  notes: string | null;
  status: string;
  createdAt: string;
  user: { id: number; name: string };
}

interface LeadDetail {
  id: number;
  nome: string;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  telefone1: string | null;
  telefone2: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  interactions: Interaction[];
}

export default function LeadModal({
  leadId,
  onClose,
  onUpdate,
}: {
  leadId: number;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data);
        setNewStatus(data.status);
      });
  }, [leadId]);

  async function handleUpdateStatus() {
    if (!newStatus || !action) return;
    setSaving(true);

    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, action, notes }),
    });

    const updated = await fetch(`/api/leads/${leadId}`).then((r) => r.json());
    setLead(updated);
    setNotes("");
    setAction("");
    setSaving(false);
    onUpdate();
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lead.nome}</h2>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block ${STATUS_COLORS[lead.status]}`}
            >
              {STATUS_LABELS[lead.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Dados do Lead
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Telefone 1:</span>
              <p className="text-gray-900 font-medium">
                {lead.telefone1 || "-"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Telefone 2:</span>
              <p className="text-gray-900 font-medium">
                {lead.telefone2 || "-"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="text-gray-900 font-medium">{lead.email || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">Localização:</span>
              <p className="text-gray-900 font-medium">
                {lead.bairro ? `${lead.bairro}, ` : ""}
                {lead.cidade || ""}/{lead.uf || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Registrar Atendimento
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Novo Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Ação realizada
              </label>
              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Ex: Ligação realizada, WhatsApp enviado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes do atendimento, motivo do fechamento..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={saving || !action}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? "Salvando..." : "Salvar Atendimento"}
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Histórico de Atendimentos
          </h3>
          {lead.interactions.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nenhum atendimento registrado
            </p>
          ) : (
            <div className="space-y-3">
              {lead.interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="border rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {interaction.user.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(interaction.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-gray-700">{interaction.action}</p>
                  {interaction.notes && (
                    <p className="text-gray-500 mt-1 text-xs">
                      {interaction.notes}
                    </p>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium mt-2 inline-block ${STATUS_COLORS[interaction.status]}`}
                  >
                    {STATUS_LABELS[interaction.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
