import { useEffect, useState } from "react";
import { Truck, ShieldCheck, Clock, Zap } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface BenefitItem {
  id: number;
  icon: string;
  text: string;
}

const FALLBACK: BenefitItem[] = [
  { id: 1, icon: "truck", text: "Domicilio gratis en pedidos +$80.000" },
  { id: 2, icon: "shield", text: "Compra 100% segura" },
  { id: 3, icon: "clock", text: "Entrega en 2 horas" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  truck: Truck,
  shield: ShieldCheck,
  clock: Clock,
  zap: Zap,
};

async function fetchBenefits(): Promise<BenefitItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners?bannerType=benefits`);
    if (!res.ok) return [];
    const banners = await res.json();
    return banners
      .filter((b: any) => b.status === "activo")
      .sort((a: any, b: any) => a.position - b.position)
      .map((b: any) => ({
        id: b.id,
        icon: b.subtitle || "zap",
        text: b.title || "",
      }));
  } catch {
    return [];
  }
}

export function PromoBanner() {
  const [items, setItems] = useState<BenefitItem[]>(FALLBACK);

  useEffect(() => {
    fetchBenefits().then((data) => {
      if (data.length > 0) setItems(data);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-4" style={{ background: "#FFF200" }}>
      <div
        className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold"
        style={{ color: "#1A1A2E" }}
      >
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || Zap;
          return (
            <span key={item.id} className="flex items-center gap-2">
              <Icon className="w-4 h-4" /> {item.text}
            </span>
          );
        })}
      </div>
    </section>
  );
}
