import { useState, useEffect } from "react";
import { Save, Globe, CreditCard, Loader2, CheckCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "payments", label: "Medios de pago", icon: CreditCard },
];

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0 ml-8">{children}</div>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`w-11 h-6 rounded-full relative transition-all ${on ? "bg-amber-400" : "bg-gray-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-1" : "left-1"}`} />
    </button>
  );
}

export default function SettingsView() {
  const [tab, setTab] = useState("general");

  // General settings: store fields
  const [storeName, setStoreName] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [payMethods, setPayMethods] = useState<any>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/settings/store`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setStoreName(d.tradeName || "");
        setDomain(d.primaryDomain || "");
        setEmail(d.email || "");
        setCurrency(d.currencyCode || "COP");
        setTimezone(d.timezone || "America/Bogota");
        setPhone(d.phone || "");
        setWhatsapp(d.whatsapp || "");
        setAddress(d.address || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/admin/settings/store`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeName: storeName,
          primaryDomain: domain,
          email,
          currencyCode: currency,
          timezone,
          phone,
          whatsapp,
          address,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const loadPaymentMethods = () => {
    setPayLoading(true);
    fetch(`${API_BASE}/admin/settings/payment-methods`, { credentials: "include" })
      .then((r) => r.json())
      .then(setPayMethods)
      .catch(() => {})
      .finally(() => setPayLoading(false));
  };

  useEffect(() => { if (tab === "payments") loadPaymentMethods(); }, [tab]);

  const toggleWompi = () => {
    if (!payMethods) return;
    const updated = { ...payMethods, wompi: { ...payMethods.wompi, enabled: !payMethods.wompi?.enabled } };
    setPayMethods(updated);
    fetch(`${API_BASE}/admin/settings/payment-methods`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  };

  const toggleWompiMethod = (method: string) => {
    if (!payMethods) return;
    const updated = {
      ...payMethods,
      wompi: { ...payMethods.wompi, methods: { ...payMethods.wompi?.methods, [method]: !payMethods.wompi?.methods?.[method] } },
    };
    setPayMethods(updated);
    fetch(`${API_BASE}/admin/settings/payment-methods`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  };

  const toggleBreb = () => {
    if (!payMethods) return;
    const updated = { ...payMethods, breb: { ...payMethods.breb, enabled: !payMethods.breb?.enabled } };
    setPayMethods(updated);
    fetch(`${API_BASE}/admin/settings/payment-methods`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ajustes generales de la tienda</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {tab === "general" && (
              <div className="space-y-0">
                <h2 className="font-bold text-gray-900 mb-5">Configuración General</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
                ) : (
                  <>
                <SettingRow label="Nombre de la tienda" sub="Visible en el encabezado y facturas">
                  <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72" />
                </SettingRow>
                <SettingRow label="Sitio web" sub="URL del frontend público">
                  <input value={domain} onChange={(e) => setDomain(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72 font-mono" />
                </SettingRow>
                <SettingRow label="Email de contacto">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72" />
                </SettingRow>
                <SettingRow label="Teléfono">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72" />
                </SettingRow>
                <SettingRow label="WhatsApp">
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72" placeholder="+57 3001234567" />
                </SettingRow>
                <SettingRow label="Dirección">
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-72" />
                </SettingRow>
                <SettingRow label="Moneda" sub="Moneda principal del catálogo">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white w-72">
                    <option value="COP">COP — Peso colombiano</option>
                    <option value="USD">USD — Dólar</option>
                  </select>
                </SettingRow>
                <SettingRow label="Zona horaria">
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white w-72">
                    <option value="America/Bogota">America/Bogota (UTC-5)</option>
                    <option value="America/Mexico_City">America/Mexico City (UTC-6)</option>
                    <option value="America/Lima">America/Lima (UTC-5)</option>
                  </select>
                </SettingRow>
                <SettingRow label="Modo mantenimiento" sub="Muestra página de mantenimiento en el sitio">
                  <Toggle defaultOn={false} />
                </SettingRow>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : saved ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
                  </button>
                </div>
                  </>
                )}
              </div>
            )}

            {tab === "payments" && (
              <div>
                <h2 className="font-bold text-gray-900 mb-5">Medios de Pago</h2>
                {!payMethods && payLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
                ) : (
                  <div className="space-y-3">
                    {/* Wompi */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Wompi</p>
                          <p className="text-xs text-gray-400">Tarjetas, PSE, Nequi</p>
                        </div>
                        <button onClick={toggleWompi} className={`w-11 h-6 rounded-full relative transition-all ${payMethods?.wompi?.enabled ? "bg-green-500" : "bg-gray-300"}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${payMethods?.wompi?.enabled ? "right-1" : "left-1"}`} />
                        </button>
                      </div>
                      {payMethods?.wompi?.enabled && (
                        <div className="space-y-2 pl-2 border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-600">Tarjeta de Crédito / Débito</span>
                            <button onClick={() => toggleWompiMethod("card")} className={`w-11 h-6 rounded-full relative transition-all ${payMethods?.wompi?.methods?.card ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${payMethods?.wompi?.methods?.card ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-600">PSE (Transferencia bancaria)</span>
                            <button onClick={() => toggleWompiMethod("pse")} className={`w-11 h-6 rounded-full relative transition-all ${payMethods?.wompi?.methods?.pse ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${payMethods?.wompi?.methods?.pse ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-600">Nequi</span>
                            <button onClick={() => toggleWompiMethod("nequi")} className={`w-11 h-6 rounded-full relative transition-all ${payMethods?.wompi?.methods?.nequi ? "bg-green-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${payMethods?.wompi?.methods?.nequi ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bre-B */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Bre-B</p>
                          <p className="text-xs text-gray-400">Transferencia entre bancos a llave @davi3148853458</p>
                        </div>
                        <button onClick={toggleBreb} className={`w-11 h-6 rounded-full relative transition-all ${payMethods?.breb?.enabled ? "bg-green-500" : "bg-gray-300"}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${payMethods?.breb?.enabled ? "right-1" : "left-1"}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Los cambios se reflejan en los medios de pago de la tienda.</p>
                  </div>
                )}
              </div>
            )}

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
                {saved ? "Guardado" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
