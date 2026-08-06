import { useEffect, useState } from "react";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Phone,
  Store,
  Truck,
  Heart,
  Zap,
  Clock,
  Star,
  type LucideIcon,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FALLBACK_BENEFITS = [
  { icon: "Truck", title: "Domicilio en 2 horas", desc: "Entregamos en toda el área metropolitana de Manizales con seguimiento en tiempo real." },
  { icon: "MapPin", title: "Cobertura completa", desc: "Barrios Milán, El Cable, Chipre, Palermo, La Enea y más de 50 zonas de la ciudad." },
  { icon: "CreditCard", title: "Múltiples métodos de pago", desc: "Efectivo, tarjeta de crédito/débito, Nequi, Daviplata, PSE y contra entrega." },
  { icon: "ShieldCheck", title: "Compra 100% segura", desc: "Transacciones cifradas, datos protegidos y garantía de devolución en todos los pedidos." },
  { icon: "Phone", title: "Atención al cliente", desc: "Lunes a domingo de 6 a.m. a 10 p.m. por WhatsApp, chat y línea directa." },
  { icon: "Store", title: "Recogida en tienda", desc: "Haz tu pedido en línea y recógelo en cualquiera de nuestras 8 sedes sin costo adicional." },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Truck, MapPin, CreditCard, ShieldCheck, Phone, Store, Heart, Zap, Clock, Star,
};

interface BenefitItem {
  id: number | string;
  icon: string;
  title: string;
  desc: string;
}

export function BenefitsSection() {
  const [items, setItems] = useState<BenefitItem[]>(FALLBACK_BENEFITS);

  useEffect(() => {
    fetch(`${API_BASE_URL}/landing/benefits`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2
          className="font-black text-2xl text-foreground mb-8 text-center"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          ¿Por qué comprar en Mercaldas?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((b) => {
            const Icon = ICON_MAP[b.icon] || Star;
            return (
              <div key={b.id ?? b.title} className="flex gap-3 p-4 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF200" }}>
                  <Icon className="w-5 h-5" style={{ color: "#1A1A2E" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
