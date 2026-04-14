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

function formatWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.startsWith("55") ? digits : `55${digits}`;
  }
  return null;
}

function WhatsAppButton({ phone }: { phone: string | null }) {
  const number = formatWhatsAppNumber(phone);
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Abrir WhatsApp
    </a>
  );
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
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-medium">
                  {lead.telefone1 || "-"}
                </p>
                <WhatsAppButton phone={lead.telefone1} />
              </div>
            </div>
            <div>
              <span className="text-gray-500">Telefone 2:</span>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-medium">
                  {lead.telefone2 || "-"}
                </p>
                <WhatsAppButton phone={lead.telefone2} />
              </div>
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
