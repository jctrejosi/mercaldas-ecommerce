import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Phone,
  Store,
  Truck,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Truck,
    title: "Domicilio en 2 horas",
    desc: "Entregamos en toda el área metropolitana de Manizales con seguimiento en tiempo real.",
  },
  {
    icon: MapPin,
    title: "Cobertura completa",
    desc: "Barrios Milán, El Cable, Chipre, Palermo, La Enea y más de 50 zonas de la ciudad.",
  },
  {
    icon: CreditCard,
    title: "Múltiples métodos de pago",
    desc: "Efectivo, tarjeta de crédito/débito, Nequi, Daviplata, PSE y contra entrega.",
  },
  {
    icon: ShieldCheck,
    title: "Compra 100% segura",
    desc: "Transacciones cifradas, datos protegidos y garantía de devolución en todos los pedidos.",
  },
  {
    icon: Phone,
    title: "Atención al cliente",
    desc: "Lunes a domingo de 6 a.m. a 10 p.m. por WhatsApp, chat y línea directa.",
  },
  {
    icon: Store,
    title: "Recogida en tienda",
    desc: "Haz tu pedido en línea y recógelo en cualquiera de nuestras 8 sedes sin costo adicional.",
  },
];

export function BenefitsSection() {
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
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex gap-3 p-4 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#FFF200" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#1A1A2E" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
