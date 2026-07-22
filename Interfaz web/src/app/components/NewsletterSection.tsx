import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
      setEmail("");
    }
  };

  return (
    <section className="py-14" style={{ background: "#1A1A2E" }}>
      <div className="max-w-xl mx-auto px-4 text-center">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: "#FFF200" }}
        >
          <Mail className="w-6 h-6" style={{ color: "#1A1A2E" }} />
        </div>
        <h2
          className="font-black text-2xl md:text-3xl text-white mb-2"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Recibe las mejores ofertas
        </h2>
        <p
          className="text-sm mb-7"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Suscríbete y sé el primero en enterarte de promociones exclusivas,
          descuentos de temporada y novedades de Mercaldas.
        </p>
        {emailSent ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#FFF200", color: "#1A1A2E" }}
          >
            <ShieldCheck className="w-4 h-4" />
            ¡Listo! Te notificaremos las mejores ofertas.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border-0 focus:outline-none bg-white text-foreground"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 whitespace-nowrap"
              style={{ background: "#FFF200", color: "#1A1A2E" }}
            >
              Suscribirme
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
