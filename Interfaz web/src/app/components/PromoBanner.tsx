import { Truck, ShieldCheck, Clock } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-4" style={{ background: "#FFF200" }}>
      <div
        className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold"
        style={{ color: "#1A1A2E" }}
      >
        <span className="flex items-center gap-2">
          <Truck className="w-4 h-4" /> Domicilio gratis en pedidos +$80.000
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Compra 100% segura
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" /> Entrega en 2 horas
        </span>
      </div>
    </section>
  );
}
