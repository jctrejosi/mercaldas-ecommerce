import { MapPin, Truck, CheckCircle, Clock, Phone, User, Package } from "lucide-react";

const DRIVERS = [
  { id: "D1", name: "Andrés Morales", phone: "+57 300 111 2233", vehicle: "Moto — ABC 123", status: "en ruta", orders: 3, avatar: "AM" },
  { id: "D2", name: "Patricia Salazar", phone: "+57 310 444 5566", vehicle: "Moto — XYZ 456", status: "disponible", orders: 0, avatar: "PS" },
  { id: "D3", name: "Juan Castellanos", phone: "+57 315 777 8899", vehicle: "Bicicleta — sin placa", status: "en ruta", orders: 2, avatar: "JC" },
  { id: "D4", name: "Mónica Restrepo", phone: "+57 318 222 3344", vehicle: "Moto — DEF 789", status: "descanso", orders: 0, avatar: "MR" },
];

const DELIVERIES = [
  { id: "MC-3819", customer: "Sofía Herrera", address: "Av. Las Vegas #56-22, El Poblado", status: "en camino", driver: "Andrés Morales", eta: "15 min", distance: "3.2 km" },
  { id: "MC-3822", customer: "Felipe Castro", address: "Calle 33 #69-12, La América", status: "en camino", driver: "Andrés Morales", eta: "28 min", distance: "6.8 km" },
  { id: "MC-3823", customer: "Claudia Vásquez", address: "Carrera 50 #20-15, Estadio", status: "pendiente", driver: "Juan Castellanos", eta: "42 min", distance: "4.1 km" },
  { id: "MC-3824", customer: "David Ospina", address: "Calle 10 #88-23, Guayabal", status: "en camino", driver: "Juan Castellanos", eta: "19 min", distance: "5.5 km" },
];

const DRIVER_STATUS: Record<string, string> = {
  "en ruta": "bg-amber-100 text-amber-700",
  disponible: "bg-green-100 text-green-700",
  descanso: "bg-gray-100 text-gray-600",
};

const DEL_STATUS: Record<string, string> = {
  "en camino": "text-purple-700 bg-purple-50",
  pendiente: "text-amber-700 bg-amber-50",
  entregado: "text-green-700 bg-green-50",
};

export default function Delivery() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Seguimiento de domicilios y conductores</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "En camino", value: "5", color: "text-purple-600 bg-purple-50" },
          { label: "Pendientes", value: "3", color: "text-amber-600 bg-amber-50" },
          { label: "Entregados hoy", value: "47", color: "text-green-600 bg-green-50" },
          { label: "Conductores activos", value: "2/4", color: "text-blue-600 bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 border border-gray-100 bg-white`}>
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Drivers */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Conductores</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {DRIVERS.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.vehicle}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DRIVER_STATUS[d.status]}`}>{d.status}</span>
                  {d.orders > 0 && <p className="text-xs text-gray-400 mt-0.5">{d.orders} pedidos</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active deliveries */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Entregas Activas</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {DELIVERIES.map((d) => (
              <div key={d.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-gray-600">{d.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DEL_STATUS[d.status]}`}>{d.status}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{d.customer}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400 truncate">{d.address}</p>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User size={10} />{d.driver}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />ETA: <strong>{d.eta}</strong></span>
                  <span>{d.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
