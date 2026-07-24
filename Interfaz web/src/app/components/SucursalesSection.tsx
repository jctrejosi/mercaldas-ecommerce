import { MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import type { Branch } from "../types";

interface SucursalesSectionProps {
  branches: Branch[];
}

function formatSchedule(schedule: Record<string, string> | null | undefined): string {
  if (!schedule) return "Horario no especificado";
  const days: Record<string, string> = {
    monday: "Lun", tuesday: "Mar", wednesday: "Mié",
    thursday: "Jue", friday: "Vie", saturday: "Sáb", sunday: "Dom",
  };
  const entries = Object.entries(schedule).filter(([, v]) => v);
  if (entries.length === 0) return "Horario no especificado";

  // Agrupar días consecutivos con el mismo horario
  const dayOrder = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  let result = "";
  let i = 0;
  while (i < entries.length) {
    const [day, hours] = entries[i];
    const dayLabel = days[day] || day;
    let j = i + 1;
    while (j < entries.length && entries[j][1] === hours) j++;
    if (j - i > 1) {
      const lastLabel = days[entries[j - 1][0]] || entries[j - 1][0];
      result += `${dayLabel}-${lastLabel}: ${hours} · `;
    } else {
      result += `${dayLabel}: ${hours} · `;
    }
    i = j;
  }
  return result.replace(/ · $/, "");
}

function openMap(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
}

function branchAddress(branch: Branch) {
  return `${branch.name}, ${branch.address}, ${branch.city}, Colombia`;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1759178388578-d3589d058c0f?w=400&h=260&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1758701446898-83d8dcf6309c?w=400&h=260&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1770993189356-f8def91ec5a5?w=400&h=260&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1770927423667-3c701c99ba3a?w=400&h=260&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format&crop=right",
  "https://images.unsplash.com/photo-1758701446898-83d8dcf6309c?w=400&h=260&fit=crop&auto=format",
];

export function SucursalesSection({ branches = [] }: SucursalesSectionProps) {
  if (branches.length === 0) return null;

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
              {branches.length} tiendas en toda la ciudad. Compra en línea y recoge en la
              más cercana sin costo adicional.
            </p>
          </div>
          <button
            onClick={() => openMap("Sucursales Mercaldas Manizales, Colombia")}
            className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-6 cursor-pointer"
          >
            Ver todas en el mapa <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((s, idx) => {
            const scheduleStr = formatSchedule(s.schedule);
            return (
              <div
                key={s.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
                onClick={() => openMap(branchAddress(s))}
              >
                <div className="relative h-40 bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
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
                  <div className="absolute bottom-2 left-3">
                    <p
                      className="text-white font-black text-base leading-tight"
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}
                    >
                      {s.name.replace("Mercaldas ", "")}
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
                      {scheduleStr}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {s.phone}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMap(branchAddress(s));
                    }}
                    className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 mt-auto"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    Cómo llegar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
