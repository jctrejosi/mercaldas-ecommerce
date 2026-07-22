import { MapPin, Clock, Phone, ChevronRight } from "lucide-react";

const SUCURSALES = [
  {
    id: 1,
    name: "Mercaldas Milán",
    barrio: "Milán",
    address: "Cra 23 # 64-60, Barrio Milán",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1001",
    services: ["Domicilios", "Parqueadero", "Panadería", "Carnicería"],
    image:
      "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format",
    badge: "Principal",
  },
  {
    id: 2,
    name: "Mercaldas El Cable",
    barrio: "El Cable",
    address: "Cll 65 # 23B-10, Barrio El Cable",
    hours: "Lun–Dom 7am–9pm",
    phone: "(606) 890-1002",
    services: ["Domicilios", "Parqueadero", "Drogería"],
    image:
      "https://images.unsplash.com/photo-1759178388578-d3589d058c0f?w=400&h=260&fit=crop&auto=format",
    badge: null,
  },
  {
    id: 3,
    name: "Mercaldas Chipre",
    barrio: "Chipre",
    address: "Av. 12 de Octubre # 41-55, Chipre",
    hours: "Lun–Dom 7am–9pm",
    phone: "(606) 890-1003",
    services: ["Domicilios", "Recogida en tienda", "Panadería"],
    image:
      "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format&crop=right",
    badge: null,
  },
  {
    id: 4,
    name: "Mercaldas Palermo",
    barrio: "Palermo",
    address: "Cra 18 # 70-24, Barrio Palermo",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1004",
    services: ["Domicilios", "Parqueadero", "Carnicería", "Licores"],
    image:
      "https://images.unsplash.com/photo-1758701446898-83d8dcf6309c?w=400&h=260&fit=crop&auto=format",
    badge: "24h Sáb",
  },
  {
    id: 5,
    name: "Mercaldas La Enea",
    barrio: "La Enea",
    address: "Cll 50 # 36-80, Barrio La Enea",
    hours: "Lun–Sáb 7am–8pm · Dom 8am–6pm",
    phone: "(606) 890-1005",
    services: ["Domicilios", "Recogida en tienda"],
    image:
      "https://images.unsplash.com/photo-1770993189356-f8def91ec5a5?w=400&h=260&fit=crop&auto=format",
    badge: null,
  },
  {
    id: 6,
    name: "Mercaldas Av. Santander",
    barrio: "Av. Santander",
    address: "Av. Santander # 52-34, Centro",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1006",
    services: [
      "Domicilios",
      "Parqueadero",
      "Panadería",
      "Drogería",
      "Carnicería",
    ],
    image:
      "https://images.unsplash.com/photo-1770927423667-3c701c99ba3a?w=400&h=260&fit=crop&auto=format",
    badge: "Nueva",
  },
];

export function SucursalesSection() {
  return (
    <section className="py-10 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div
              className="inline-block px-2 py-0.5 rounded text-xs font-black tracking-widest mb-2"
              style={{ background: "#1A1A2E", color: "#FFF200" }}
            >
              NUESTRAS TIENDAS
            </div>
            <h2
              className="font-black text-2xl text-foreground"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Sucursales en Manizales
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              6 tiendas en toda la ciudad. Compra en línea y recoge en la
              más cercana sin costo adicional.
            </p>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-6"
          >
            Ver en el mapa <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUCURSALES.map((s) => (
            <div
              key={s.id}
              className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="relative h-40 bg-muted overflow-hidden flex-shrink-0">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(26,26,46,0.6) 0%, transparent 55%)",
                  }}
                />
                {s.badge && (
                  <span
                    className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    {s.badge}
                  </span>
                )}
                <div className="absolute bottom-2 left-3">
                  <p
                    className="text-white font-black text-base leading-tight"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                  >
                    {s.barrio}
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {s.address}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {s.hours}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {s.phone}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {s.services.map((sv) => (
                    <span
                      key={sv}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#F4F4F6", color: "#6B7280" }}
                    >
                      {sv}
                    </span>
                  ))}
                </div>
                <button
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 mt-1"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  Cómo llegar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
