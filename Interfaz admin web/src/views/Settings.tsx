import { useState } from "react";
import { Save, Globe, CreditCard, Truck, Percent, Bell, Mail, Zap, Clock } from "lucide-react";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "payments", label: "Medios de pago", icon: CreditCard },
  { id: "shipping", label: "Envíos", icon: Truck },
  { id: "taxes", label: "Impuestos", icon: Percent },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "schedule", label: "Horario", icon: Clock },
  { id: "integrations", label: "Integraciones", icon: Zap },
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
                <SettingRow label="Nombre de la tienda" sub="Visible en el encabezado y facturas">
                  <input defaultValue="Mercaldas" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-52" />
                </SettingRow>
                <SettingRow label="Sitio web" sub="URL del frontend público">
                  <input defaultValue="https://mercaldas.com" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-52 font-mono" />
                </SettingRow>
                <SettingRow label="Email de contacto">
                  <input defaultValue="hola@mercaldas.com" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 w-52" />
                </SettingRow>
                <SettingRow label="Moneda" sub="Moneda principal del catálogo">
                  <select defaultValue="COP" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="COP">COP — Peso colombiano</option>
                    <option value="USD">USD — Dólar</option>
                  </select>
                </SettingRow>
                <SettingRow label="Zona horaria">
                  <select className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option>America/Bogota (UTC-5)</option>
                  </select>
                </SettingRow>
                <SettingRow label="Modo mantenimiento" sub="Muestra página de mantenimiento en el sitio">
                  <Toggle defaultOn={false} />
                </SettingRow>
              </div>
            )}

            {tab === "payments" && (
              <div>
                <h2 className="font-bold text-gray-900 mb-5">Medios de Pago</h2>
                <div className="space-y-3">
                  {[
                    { name: "Tarjeta de Crédito / Débito", provider: "Wompi", enabled: true },
                    { name: "PSE", provider: "Wompi", enabled: true },
                    { name: "Nequi", provider: "Nequi API", enabled: true },
                    { name: "Efecty / Baloto", provider: "PayU", enabled: false },
                    { name: "Pago contra entrega (efectivo)", provider: "Manual", enabled: true },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">Proveedor: {p.provider}</p>
                      </div>
                      <Toggle defaultOn={p.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div>
                <h2 className="font-bold text-gray-900 mb-5">Notificaciones</h2>
                <div className="space-y-0">
                  {[
                    { label: "Nuevo pedido recibido", sub: "Email + push al equipo" },
                    { label: "Pedido entregado", sub: "Email al cliente" },
                    { label: "Stock bajo (< mínimo)", sub: "Push a administradores" },
                    { label: "Nuevo registro de cliente", sub: "Email de bienvenida automático" },
                    { label: "Pago fallido", sub: "Email + push al supervisor" },
                    { label: "Cupón utilizado", sub: "Registrar en analítica" },
                  ].map((n) => (
                    <SettingRow key={n.label} label={n.label} sub={n.sub}>
                      <Toggle defaultOn={true} />
                    </SettingRow>
                  ))}
                </div>
              </div>
            )}

            {tab === "schedule" && (
              <div>
                <h2 className="font-bold text-gray-900 mb-5">Horario de la Tienda</h2>
                <div className="space-y-3">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, i) => (
                    <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-700 w-24">{day}</span>
                      <Toggle defaultOn={i < 6} />
                      <div className="flex items-center gap-2 ml-2">
                        <input type="time" defaultValue="08:00" className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        <span className="text-gray-400 text-sm">—</span>
                        <input type="time" defaultValue="22:00" className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tab === "shipping" || tab === "taxes" || tab === "integrations") && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  {tab === "shipping" ? <Truck size={24} className="text-gray-400" /> : tab === "taxes" ? <Percent size={24} className="text-gray-400" /> : <Zap size={24} className="text-gray-400" />}
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Próximamente</p>
                <p className="text-xs text-gray-400">Esta sección estará disponible en la siguiente versión</p>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">
                <Save size={14} /> Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
