import { useState } from "react";
import { Plus, Shield, Edit, MoreHorizontal, Check, X } from "lucide-react";

const ROLES = [
  { id: "R1", name: "Administrador", users: 2, color: "bg-red-100 text-red-700", perms: 42 },
  { id: "R2", name: "Supervisor de Tienda", users: 5, color: "bg-amber-100 text-amber-700", perms: 28 },
  { id: "R3", name: "Cajero", users: 12, color: "bg-blue-100 text-blue-700", perms: 12 },
  { id: "R4", name: "Bodeguero", users: 8, color: "bg-green-100 text-green-700", perms: 15 },
  { id: "R5", name: "Marketing", users: 3, color: "bg-purple-100 text-purple-700", perms: 18 },
];

const USERS = [
  { id: "U1", name: "Jorge Ramírez", email: "jorge@mercaldas.com", role: "Administrador", status: "activo", lastLogin: "Hoy, 08:32", avatar: "JR" },
  { id: "U2", name: "Carolina Mejía", email: "carolina@mercaldas.com", role: "Supervisor de Tienda", status: "activo", lastLogin: "Hoy, 09:15", avatar: "CM" },
  { id: "U3", name: "David Arango", email: "david@mercaldas.com", role: "Marketing", status: "activo", lastLogin: "Ayer, 18:22", avatar: "DA" },
  { id: "U4", name: "Sandra Ríos", email: "sandra@mercaldas.com", role: "Bodeguero", status: "activo", lastLogin: "Hoy, 07:45", avatar: "SR" },
  { id: "U5", name: "Felipe Zuluaga", email: "felipe@mercaldas.com", role: "Cajero", status: "inactivo", lastLogin: "hace 3 días", avatar: "FZ" },
];

const AUDIT = [
  { user: "Jorge Ramírez", action: "Actualizó precio de Leche Alquería 1.1L", time: "hace 10m", type: "edit" },
  { user: "Carolina Mejía", action: "Aprobó pedido #MC-3821", time: "hace 22m", type: "approve" },
  { user: "David Arango", action: "Creó banner Flash Sale Viernes", time: "hace 1h", type: "create" },
  { user: "Sandra Ríos", action: "Actualizó stock de Huevos AA x30", time: "hace 2h", type: "edit" },
  { user: "Jorge Ramírez", action: "Eliminó promoción expirada", time: "hace 3h", type: "delete" },
];

const TYPE_COLOR: Record<string, string> = { edit: "bg-blue-100 text-blue-600", approve: "bg-green-100 text-green-600", create: "bg-amber-100 text-amber-600", delete: "bg-red-100 text-red-600" };

const PERMS = ["Ver productos", "Editar productos", "Crear productos", "Eliminar productos", "Ver pedidos", "Gestionar pedidos", "Ver clientes", "Gestionar clientes", "Ver reportes", "Gestionar banners", "Editar homepage", "Gestionar usuarios"];

export default function UsersView() {
  const [tab, setTab] = useState<"usuarios" | "roles" | "auditoria">("usuarios");

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios y Permisos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona el acceso del equipo</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
          <Plus size={14} /> Nuevo usuario
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {(["usuarios", "roles", "auditoria"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${tab === t ? "border-amber-400 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "usuarios" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Usuario", "Rol", "Estado", "Último acceso", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {USERS.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLES.find((r) => r.name === u.role)?.color || "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.status === "activo" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><Edit size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${r.color}`}>
                  <Shield size={16} />
                </div>
                <p className="text-sm font-bold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-400 mt-1">{r.users} usuarios</p>
                <p className="text-xs text-gray-400">{r.perms} permisos</p>
              </div>
            ))}
          </div>

          {/* Permissions matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Matriz de permisos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Permiso</th>
                    {ROLES.map((r) => (
                      <th key={r.id} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 min-w-20">{r.name.split(" ")[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PERMS.map((perm, i) => (
                    <tr key={perm} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-sm text-gray-700">{perm}</td>
                      {ROLES.map((r, j) => {
                        const hasIt = r.id === "R1" || (r.id === "R2" && i < 8) || (r.id === "R3" && i === 4) || (r.id === "R4" && [7, 10].includes(i)) || (r.id === "R5" && [8, 9, 10].includes(i));
                        return (
                          <td key={r.id} className="px-3 py-2.5 text-center">
                            {hasIt
                              ? <Check size={14} className="mx-auto text-green-500" />
                              : <X size={14} className="mx-auto text-gray-200" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "auditoria" && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Historial de auditoría</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {AUDIT.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${TYPE_COLOR[a.type]}`}>{a.type}</span>
                <p className="flex-1 text-sm text-gray-700"><strong className="text-gray-900">{a.user}</strong> {a.action}</p>
                <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
