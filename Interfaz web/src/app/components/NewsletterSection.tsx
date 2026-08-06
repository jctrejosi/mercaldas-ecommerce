import { useState } from "react";
import { Mail, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones del newsletter");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || undefined,
          acceptedTerms,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string })?.message ??
            "No pudimos completar tu suscripción",
        );
      }
      setEmailSent(true);
      setEmail("");
      setName("");
      setAcceptedTerms(false);
    } catch (err: any) {
      setError(err.message || "Error al suscribirte");
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm border-0 focus:outline-none bg-white text-foreground"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full px-4 py-2.5 rounded-xl text-sm border-0 focus:outline-none bg-white text-foreground"
            />
            <label
              className="flex items-start gap-2.5 text-left cursor-pointer select-none"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#FFF200] shrink-0"
              />
              <span className="text-xs leading-relaxed">
                Acepto los{" "}
                <span className="font-semibold" style={{ color: "#FFF200" }}>
                  términos y condiciones
                </span>{" "}
                del newsletter y autorizo el envío de comunicaciones
                promocionales de Mercaldas a mi correo.
              </span>
            </label>
            {error && (
              <div
                className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 text-left"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "#fca5a5",
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-60"
              style={{ background: "#FFF200", color: "#1A1A2E" }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suscribiendo...
                </span>
              ) : (
                "Suscribirme"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
