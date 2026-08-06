import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, X, Loader2, Mail, Send, Calendar, Users,
  Check, Save, AlertTriangle, FileText, Search, Eye, Megaphone,
} from "lucide-react";
import {
  newsletterService,
  type NewsletterCampaign,
  type NewsletterSubscriber,
  type CreateCampaignData,
} from "../services/newsletter.service";

const STATUS_BADGE: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-600 border-gray-200",
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  enviando: "bg-amber-50 text-amber-700 border-amber-200",
  enviada: "bg-green-50 text-green-700 border-green-200",
  fallida: "bg-red-50 text-red-600 border-red-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  programada: "Programada",
  enviando: "Enviando...",
  enviada: "Enviada",
  fallida: "Fallida",
  cancelada: "Cancelada",
};

// ── Campaign Editor ──
function CampaignEditor({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: NewsletterCampaign | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!campaign;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [subject, setSubject] = useState(campaign?.subject ?? "");
  const [imageUrl, setImageUrl] = useState(campaign?.imageUrl ?? "");
  const [content, setContent] = useState(campaign?.content ?? "");
  const [scheduleMode, setScheduleMode] = useState<"draft" | "now" | "scheduled">(
    campaign?.status === "programada" && campaign?.scheduledAt
      ? "scheduled"
      : "draft",
  );
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduledAt
      ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
      : "",
  );

  const handleSave = async () => {
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    if (!subject.trim()) { setError("El asunto es obligatorio"); return; }
    if (content.trim().length < 10) { setError("El contenido es muy corto"); return; }
    setError(""); setSaving(true);
    try {
      const data: CreateCampaignData = {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        scheduledAt:
          scheduleMode === "scheduled" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
      };
      if (isEdit && campaign) await newsletterService.updateCampaign(campaign.id, data);
      else await newsletterService.createCampaign(data);
      onSaved();
    } catch (e: any) { setError(e.message || "Error al guardar"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">
            {isEdit ? "Editar Campaña" : "Nueva Campaña"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><FileText size={12} /> Información</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título interno *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: Promo de fin de semana" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asunto del correo *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: ¡No te pierdas nuestras ofertas!" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen de encabezado (URL)</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="https://..." />
              {imageUrl && <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-24"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Mail size={12} /> Contenido HTML</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cuerpo del correo *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
                placeholder={'<p>Hola {{name}},</p><p>Esta semana tenemos increíbles ofertas...</p>'}
              />
              <p className="text-[10px] text-gray-400 mt-1">Puedes usar HTML. Placeholder disponible: {"{{name}}"} (nombre del suscriptor).</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Calendar size={12} /> Programación</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={scheduleMode === "draft"} onChange={() => setScheduleMode("draft")} className="accent-amber-500" />
                <span className="text-sm text-gray-700">Guardar como borrador</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={scheduleMode === "scheduled"} onChange={() => setScheduleMode("scheduled")} className="accent-amber-500" />
                <span className="text-sm text-gray-700">Programar para una fecha</span>
              </label>
              {scheduleMode === "scheduled" && (
                <div className="pl-6">
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full max-w-xs px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 rounded-xl hover:bg-amber-500 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Guardar cambios" : "Crear campaña"}
            </button>
            <button onClick={onClose} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm modal ──
function ConfirmModal({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Subscribers tab ──
function SubscribersTab() {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await newsletterService.getSubscribers({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 200,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || "Error al cargar suscriptores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await newsletterService.removeSubscriber(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <div className="ml-auto text-sm text-gray-500 flex items-center gap-1.5">
          <Users size={14} className="text-amber-500" />
          <span className="font-bold text-gray-800">{total}</span> suscriptores
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay suscriptores todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.isActive ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                  {(s.name || s.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.email}</p>
                  <p className="text-xs text-gray-400">
                    {s.name || "Sin nombre"} · {new Date(s.subscribedAt).toLocaleDateString("es-CO")}
                    {s.acceptedTerms && <span className="text-green-600 ml-1.5">· Aceptó términos</span>}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {s.isActive ? "Activo" : "Inactivo"}
                </span>
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar suscriptor"
          message={`¿Eliminar ${deleteTarget.email} de la lista?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Campaigns tab ──
function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<NewsletterCampaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterCampaign | null>(null);
  const [sendTarget, setSendTarget] = useState<NewsletterCampaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      setCampaigns(await newsletterService.getCampaigns());
    } catch (e: any) {
      setError(e.message || "Error al cargar campañas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSend = async () => {
    if (!sendTarget) return;
    setSendingId(sendTarget.id);
    try {
      await newsletterService.sendCampaign(sendTarget.id);
      setSendTarget(null);
      fetchCampaigns();
    } catch (e: any) {
      setError(e.message || "Error al enviar");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await newsletterService.deleteCampaign(deleteTarget.id);
      setDeleteTarget(null);
      fetchCampaigns();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  const canEdit = (c: NewsletterCampaign) =>
    c.status !== "enviada" && c.status !== "enviando";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {campaigns.length} campañas · {campaigns.filter((c) => c.status === "enviada").length} enviadas
        </p>
        <button
          onClick={() => { setSelected(null); setEditorOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-amber-900 rounded-xl font-bold text-sm hover:bg-amber-500 transition-colors"
        >
          <Plus size={16} /> Nueva Campaña
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Mail size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay campañas de newsletter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.status === "enviada" ? "bg-green-50 text-green-600" : c.status === "fallida" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 truncate">{c.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[c.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                    {c.status === "enviada" && (
                      <span className="text-[10px] text-gray-400">
                        {c.sentCount} enviados{c.failedCount > 0 ? ` · ${c.failedCount} fallidos` : ""}
                      </span>
                    )}
                    {c.status === "programada" && c.scheduledAt && (
                      <span className="text-[10px] text-blue-600 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(c.scheduledAt).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewCampaign(c)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Vista previa"
                  >
                    <Eye size={15} />
                  </button>
                  {canEdit(c) && (
                    <>
                      <button
                        onClick={() => { setSelected(c); setEditorOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={15} />
                      </button>
                      {c.status === "borrador" && (
                        <button
                          onClick={() => setSendTarget(c)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Enviar ahora"
                        >
                          {sendingId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editorOpen && (
        <CampaignEditor
          campaign={selected}
          onClose={() => { setEditorOpen(false); setSelected(null); }}
          onSaved={() => {
            setEditorOpen(false);
            setSelected(null);
            fetchCampaigns();
          }}
        />
      )}

      {previewCampaign && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center" onClick={() => setPreviewCampaign(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Vista previa — {previewCampaign.title}</h2>
              <button onClick={() => setPreviewCampaign(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
            </div>
            <div className="p-6">
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-[#1A1A2E] p-5 text-center">
                  <span className="text-amber-400 font-bold text-xl">Merc<span className="text-white">Aldas</span></span>
                </div>
                <div className="p-6">
                  {previewCampaign.imageUrl && (
                    <img src={previewCampaign.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{previewCampaign.subject}</h3>
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewCampaign.content }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {sendTarget && (
        <ConfirmModal
          title="Enviar campaña"
          message={`¿Enviar "${sendTarget.title}" a todos los suscriptores activos ahora? Esta acción no se puede deshacer.`}
          confirmLabel="Enviar ahora"
          onConfirm={handleSend}
          onCancel={() => setSendTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar campaña"
          message={`¿Eliminar la campaña "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Main View ──
export default function Newsletter() {
  const [tab, setTab] = useState<"campaigns" | "subscribers">("campaigns");
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    newsletterService.getSubscriberCount().then((r) => setSubscriberCount(r.total)).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail size={24} className="text-amber-500" />
            Newsletter
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Campañas de correo y suscriptores
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <Users size={14} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-800">{subscriberCount}</span>
          <span className="text-xs text-amber-700">suscriptores activos</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "campaigns" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Megaphone size={14} /> Campañas
        </button>
        <button
          onClick={() => setTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "subscribers" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Users size={14} /> Suscriptores
        </button>
      </div>

      {tab === "campaigns" ? <CampaignsTab /> : <SubscribersTab />}
    </div>
  );
}
